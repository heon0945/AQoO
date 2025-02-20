package org.com.aqoo.domain.gameA.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.com.aqoo.domain.auth.dto.UserInfoResponse;
import org.com.aqoo.domain.auth.service.UserService;
import org.com.aqoo.domain.chat.model.ChatRoom;
import org.com.aqoo.domain.chat.service.ChatRoomService;
import org.com.aqoo.domain.gameA.dto.GameAPlayerDto; // 변경됨
import org.com.aqoo.domain.gameA.dto.PressMessage;
import org.com.aqoo.domain.gameA.dto.RoomResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Slf4j
@AllArgsConstructor
public class GameAService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomService chatRoomService;
    private final UserService userService;

    // 각 방의 점수를 관리하는 Map: roomId -> (userName -> score)
    private final Map<String, Map<String, Integer>> scoreMap = new ConcurrentHashMap<>();

    // 각 방의 finish order(결승 순위)를 관리하는 Map: roomId -> List of userName (100에 도달한 순서)
    private final Map<String, List<String>> finishOrderMap = new ConcurrentHashMap<>();

    // 각 방의 사용자별 스턴 상태(스턴 해제 시각)를 관리하는 Map: roomId -> (userName -> 스턴 해제 타임스탬프)
    private final Map<String, Map<String, Long>> stunMap = new ConcurrentHashMap<>();

    /**
     * 게임 시작 시, 각 방에 대한 점수, 스턴, finishOrder를 초기화하고
     * 100개의 랜덤 방향(0, 1, 2, 3)을 담은 리스트를 생성하여 클라이언트에 전달
     */
    @Transactional
    public void startGame(String roomId) {
        log.info("startGame() called for roomId: {}", roomId);
        ChatRoom chatRoom = chatRoomService.getRoom(roomId);
        if (chatRoom != null) {
            System.out.println("ChatRoom members: " + chatRoom.getMembers());
            Map<String, Integer> roomScore = new ConcurrentHashMap<>();
            chatRoom.getMembers().forEach(member -> roomScore.put(member, 0));
            scoreMap.put(roomId, roomScore);
            finishOrderMap.put(roomId, new ArrayList<>());
            stunMap.put(roomId, new ConcurrentHashMap<>());

            // 100개의 랜덤 방향(0, 1, 2, 3)을 생성
            List<Integer> directionSequence = generateRandomDirectionSequence(100);
            log.info("Direction sequence for room {}: {}", roomId, directionSequence);

            // GameAPlayerDto로 플레이어 정보를 구성
            List<GameAPlayerDto> players = roomScore.entrySet().stream()
                    .map(e -> {
                        String userName = e.getKey();
                        int score = e.getValue();
                        UserInfoResponse userInfo = userService.getUserInfo(userName);
                        String mainFishImage = userInfo.getMainFishImage();
                        String nickname = userInfo.getNickname();
                        return new GameAPlayerDto(userName, score, mainFishImage, nickname);
                    })
                    .collect(Collectors.toList());

            // RoomResponse에 directionSequence 필드를 추가했다고 가정합니다.
            RoomResponse response = new RoomResponse(roomId, players, "GAME_A_STARTED", null, null, directionSequence);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
            log.info("Broadcasted GAME_A_STARTED message for roomId: {}", roomId);
        } else {
            log.error("ChatRoom not found for roomId: {}", roomId);
        }
    }

    /**
     * 방향키 입력 이벤트 처리
     * - 스턴 상태이면 입력 무시
     * - 입력 방향(0~3)이 현재 단계의 정답과 일치하면 점수를 1 증가
     *   - 올바른 경우에는 게임 진행 중 추가 로직(예, 다음 단계로 진행)을 처리
     * - 오답이면 해당 사용자를 1초간 스턴 처리
     * - 100점 도달 시 finishOrder에 기록, 모든 사용자가 100점이면 게임 종료
     */
    @Transactional
    public void processPress(PressMessage pressMessage) {
        String roomId = pressMessage.getRoomId();
        String user = pressMessage.getUserName();
        int pressedDirection = pressMessage.getDirection();

        log.info("processPress() called: roomId={}, userName={}, pressedDirection={}", roomId, user, pressedDirection);

        Map<String, Integer> roomScore = scoreMap.get(roomId);
        Map<String, Long> roomStunMap = stunMap.get(roomId);
        if (roomScore == null || roomStunMap == null) {
            log.error("No score or stun map found for roomId: {}", roomId);
            return;
        }

        long currentTime = System.currentTimeMillis();
        // 스턴 상태 체크
        if (roomStunMap.containsKey(user)) {
            long stunEndTime = roomStunMap.get(user);
            if (currentTime < stunEndTime) {
                log.info("User {} is stunned until {}. Ignoring input.", user, stunEndTime);
                return;
            } else {
                roomStunMap.remove(user);
            }
        }

        // 이미 100 이상이면 추가 입력 무시
        if (roomScore.getOrDefault(user, 0) >= 100) {
            log.info("User {} already reached 100, ignoring input", user);
            return;
        }

        // 현재 단계의 정답(예를 들어, 클라이언트에서 진행 상황에 따라 확인 가능)
        // 이 예시에서는 클라이언트가 전달한 방향이 정답이라고 가정하여 단순히 점수를 1 증가시킵니다.
        if (isAnswerCorrect(user, pressedDirection)) {
            roomScore.merge(user, 1, (oldVal, inc) -> Math.min(100, oldVal + inc));
            int currentScore = roomScore.get(user);
            log.info("User {} answered correctly. New score: {}", user, currentScore);
        } else {
            // 오답: 1초간 스턴 처리
            roomStunMap.put(user, currentTime + 1000);
            log.info("User {} answered incorrectly. Stunned for 1 second.", user);
        }

        // 100점 도달 시 finishOrder 기록
        List<String> finishOrder = finishOrderMap.computeIfAbsent(roomId, k -> new ArrayList<>());
        if (roomScore.get(user) == 100 && !finishOrder.contains(user)) {
            finishOrder.add(user);
            log.info("User {} finished! Finish order: {}", user, finishOrder);
        }

        // GameAPlayerDto로 플레이어 목록 구성
        List<GameAPlayerDto> players = roomScore.entrySet().stream()
                .map(e -> {
                    String userName = e.getKey();
                    int score = e.getValue();
                    UserInfoResponse userInfo = userService.getUserInfo(userName);
                    String mainFishImage = userInfo.getMainFishImage();
                    String nickname = userInfo.getNickname();
                    return new GameAPlayerDto(userName, score, mainFishImage, nickname);
                })
                .collect(Collectors.toList());

        boolean allReached100 = roomScore.values().stream().allMatch(score -> score >= 100);
        if (allReached100) {
            String winnerId = finishOrder.get(0);
            String winner = userService.getUserInfo(winnerId).getNickname();
            RoomResponse response = new RoomResponse(roomId, players, "GAME_ENDED", winner, finishOrder, null);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
            log.info("Broadcasted GAME_ENDED message for roomId: {} with finish order: {}", roomId, finishOrder);
        } else {
            RoomResponse response = new RoomResponse(roomId, players, "PRESS_UPDATED", null, null, null);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
            log.info("Broadcasted PRESS_UPDATED message for roomId: {}", roomId);
        }
    }

    /**
     * 타임아웃 등으로 게임 종료 시 처리
     *  - 100점 도달한 유저는 finishOrder에 기록된 순서 유지
     *  - 100점 미달 유저는 점수 내림차순으로 정렬하여 뒤에 이어붙임
     *  - 최종 승자는 finishOrder의 첫 번째 유저
     */
    @Transactional
    public void endGame(String roomId) {
        log.info("endGame() called for roomId: {}", roomId);
        Map<String, Integer> roomScore = scoreMap.get(roomId);
        if (roomScore != null) {
            List<GameAPlayerDto> players = roomScore.entrySet().stream()
                    .map(e -> {
                        String userName = e.getKey();
                        int score = e.getValue();
                        UserInfoResponse userInfo = userService.getUserInfo(userName);
                        String mainFishImage = userInfo.getMainFishImage();
                        String nickname = userInfo.getNickname();
                        return new GameAPlayerDto(userName, score, mainFishImage, nickname);
                    })
                    .collect(Collectors.toList());

            List<String> finishOrder = new ArrayList<>(finishOrderMap.getOrDefault(roomId, new ArrayList<>()));
            Set<String> finishedUsers = new HashSet<>(finishOrder);
            List<Map.Entry<String, Integer>> notFinishedList = roomScore.entrySet().stream()
                    .filter(e -> !finishedUsers.contains(e.getKey()))
                    .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()))
                    .collect(Collectors.toList());
            for (Map.Entry<String, Integer> entry : notFinishedList) {
                finishOrder.add(entry.getKey());
            }

            String computedWinner = finishOrder.isEmpty() ? null : finishOrder.get(0);
            RoomResponse response = new RoomResponse(roomId, players, "GAME_ENDED",
                    computedWinner != null ? userService.getUserInfo(computedWinner).getNickname() : null,
                    finishOrder, null);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
            log.info("Game ended via timeout for roomId: {}. Winner: {}. Final finish order: {}",
                    roomId, computedWinner, finishOrder);
        } else {
            log.error("No score map found for roomId: {}", roomId);
        }
    }

    /**
     * 100개의 랜덤 방향(0,1,2,3) 리스트를 생성하는 헬퍼 메서드
     */
    private List<Integer> generateRandomDirectionSequence(int count) {
        List<Integer> sequence = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            sequence.add(ThreadLocalRandom.current().nextInt(4));
        }
        return sequence;
    }

    /**
     * 현재 입력이 정답인지 확인하는 메서드  
     * 실제 게임 로직에 따라 클라이언트의 진행 단계(index)와 서버의 정답을 비교하는 로직을 구현해야 합니다.
     * 이 예시에서는 단순히 true를 반환하도록 되어 있습니다.
     */
    private boolean isAnswerCorrect(String user, int pressedDirection) {
        // TODO: 실제 게임 진행 로직에 따라 정답 여부를 확인하도록 구현
        return true;
    }
}
