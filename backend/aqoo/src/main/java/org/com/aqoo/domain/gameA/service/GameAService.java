package org.com.aqoo.domain.gameA.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.com.aqoo.domain.auth.dto.UserInfoResponse;
import org.com.aqoo.domain.auth.service.UserService;
import org.com.aqoo.domain.chat.model.ChatRoom;
import org.com.aqoo.domain.chat.service.ChatRoomService;
import org.com.aqoo.domain.gameA.dto.GameAPlayerDto;
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

    /** (1) 각 방의 점수를 관리하는 Map: roomId -> (userName -> score) */
    private final Map<String, Map<String, Integer>> scoreMap = new ConcurrentHashMap<>();

    /** (2) 각 방의 finish order(결승 순위)를 관리하는 Map: roomId -> List of userName (100에 도달한 순서) */
    private final Map<String, List<String>> finishOrderMap = new ConcurrentHashMap<>();

    /** (3) 각 방의 사용자별 스턴 상태(스턴 해제 시각)를 관리하는 Map: roomId -> (userName -> 스턴 해제 타임스탬프) */
    private final Map<String, Map<String, Long>> stunMap = new ConcurrentHashMap<>();

    /** (4) 각 방의 방향키 시퀀스: roomId -> List<Integer>(0,1,2,3) */
    private final Map<String, List<Integer>> directionSequenceMap = new ConcurrentHashMap<>();

    /** (5) user별 현재 단계(몇 번째 방향인지) 관리: roomId -> (userName -> 현재 인덱스) */
    private final Map<String, Map<String, Integer>> userStepMap = new ConcurrentHashMap<>();

    /**
     * 게임 시작 시,
     *  - scoreMap, stunMap, finishOrderMap, userStepMap 초기화
     *  - 100개의 랜덤 방향(0,1,2,3) 생성하여 directionSequenceMap에 저장
     *  - 클라이언트에 GAME_A_STARTED 메시지 전송 (directionSequence도 함께)
     */
    @Transactional
    public void startGame(String roomId) {
        log.info("startGame() called for roomId: {}", roomId);
        ChatRoom chatRoom = chatRoomService.getRoom(roomId);
        if (chatRoom != null) {
            System.out.println("ChatRoom members: " + chatRoom.getMembers());

            // 방에 참여 중인 유저들의 score, step 초기화
            Map<String, Integer> roomScore = new ConcurrentHashMap<>();
            Map<String, Integer> roomStep = new ConcurrentHashMap<>();

            for (String member : chatRoom.getMembers()) {
                roomScore.put(member, 0); // 점수 0
                roomStep.put(member, 0);  // 현재 단계 index 0
            }

            scoreMap.put(roomId, roomScore);
            stunMap.put(roomId, new ConcurrentHashMap<>());
            finishOrderMap.put(roomId, new ArrayList<>());
            userStepMap.put(roomId, roomStep);

            // 100개의 랜덤 방향(0, 1, 2, 3)을 생성하여 저장
            List<Integer> directionSequence = generateRandomDirectionSequence(100);
            directionSequenceMap.put(roomId, directionSequence);
            log.info("Direction sequence for room {}: {}", roomId, directionSequence);

            // 클라이언트로 보낼 플레이어 정보 구성
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

            // RoomResponse에 directionSequence 포함하여 브로드캐스트
            RoomResponse response = new RoomResponse(
                    roomId,
                    players,
                    "GAME_A_STARTED",
                    null,
                    null,
                    directionSequence
            );
            messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
            log.info("Broadcasted GAME_A_STARTED for roomId: {}", roomId);
        } else {
            log.error("ChatRoom not found for roomId: {}", roomId);
        }
    }

    /**
     * 방향키 입력 이벤트 처리 (사용자가 방향키를 눌렀을 때)
     * - 스턴 상태이면 입력 무시
     * - 100점 도달했으면 더 이상 입력 무시
     * - 정답이면 점수 +1, userStepMap(인덱스)도 +1
     * - 오답이면 1초 스턴
     * - 모든 유저가 100점이면 GAME_ENDED
     * - 아니면 PRESS_UPDATED
     */
    @Transactional
    public void processPress(PressMessage pressMessage) {
        String roomId = pressMessage.getRoomId();
        String user = pressMessage.getUserName();
        int pressedDirection = pressMessage.getDirection();

        log.info("processPress() called: roomId={}, userName={}, pressedDirection={}",
                roomId, user, pressedDirection);

        Map<String, Integer> roomScore = scoreMap.get(roomId);
        Map<String, Long> roomStunMap = stunMap.get(roomId);
        List<String> finishOrder = finishOrderMap.computeIfAbsent(roomId, k -> new ArrayList<>());

        if (roomScore == null || roomStunMap == null) {
            log.error("No score or stun map found for roomId: {}", roomId);
            return;
        }

        long currentTime = System.currentTimeMillis();

        // (1) 스턴 상태 체크
        if (roomStunMap.containsKey(user)) {
            long stunEndTime = roomStunMap.get(user);
            if (currentTime < stunEndTime) {
                log.info("User {} is stunned until {}. Ignoring input.", user, stunEndTime);
                return;
            } else {
                // 스턴 해제된 경우 stunMap에서 제거
                roomStunMap.remove(user);
            }
        }

        // (2) 이미 100점이면 추가 입력 무시
        if (roomScore.getOrDefault(user, 0) >= 100) {
            log.info("User {} already reached 100, ignoring input", user);
            return;
        }

        // (3) 정답/오답 판별
        boolean correct = isAnswerCorrect(roomId, user, pressedDirection);
        if (correct) {
            // 점수 +1
            roomScore.merge(user, 1, (oldVal, inc) -> Math.min(100, oldVal + inc));

            // userStepMap도 +1 (다음 인덱스로 넘어감)
            userStepMap.get(roomId).merge(user, 1, Integer::sum);

            int currentScore = roomScore.get(user);
            log.info("User {} answered correctly. New score: {}", user, currentScore);

            // 100점 도달 시 finishOrder 기록
            if (currentScore == 100 && !finishOrder.contains(user)) {
                finishOrder.add(user);
                log.info("User {} finished! Finish order: {}", user, finishOrder);
            }

        } else {
            // (오답) 1초 스턴
            roomStunMap.put(user, currentTime + 1000);
            log.info("User {} answered incorrectly. Stunned for 1 second.", user);
        }

        // (4) 모든 유저가 100점인지 검사
        boolean allReached100 = roomScore.values().stream()
                .allMatch(score -> score >= 100);

        // (5) GameAPlayerDto로 현재 플레이어 상태를 구성
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

        // (6) 게임 종료 or 진행 중 상태 브로드캐스트
        if (allReached100) {
            // 가장 먼저 100점 달성한 유저가 1등
            String winnerId = finishOrder.isEmpty() ? null : finishOrder.get(0);
            String winnerNickname = (winnerId != null)
                    ? userService.getUserInfo(winnerId).getNickname()
                    : null;

            RoomResponse response = new RoomResponse(
                    roomId,
                    players,
                    "GAME_ENDED",
                    winnerNickname,
                    finishOrder,
                    null
            );
            messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
            log.info("Broadcasted GAME_ENDED for roomId: {} with finish order: {}",
                    roomId, finishOrder);

        } else {
            // 게임 진행 중
            RoomResponse response = new RoomResponse(
                    roomId,
                    players,
                    "PRESS_UPDATED",
                    null,
                    null,
                    null
            );
            messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
            log.info("Broadcasted PRESS_UPDATED for roomId: {}", roomId);
        }
    }

    /**
     * (7) 타임아웃 등으로 게임이 강제 종료될 때
     *  - 이미 finishOrder에 들어있는 유저는 그대로 순위 유지
     *  - 100점 미달 유저는 score 내림차순으로 뒤에 이어붙임
     *  - 최종 승자는 finishOrder 첫 번째 유저
     */
    @Transactional
    public void endGame(String roomId) {
        log.info("endGame() called for roomId: {}", roomId);
        Map<String, Integer> roomScore = scoreMap.get(roomId);
        if (roomScore == null) {
            log.error("No score map found for roomId: {}", roomId);
            return;
        }

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

        // 아직 100점 못 찍은 유저들(score 내림차순 정렬해서 뒤에 붙임)
        List<Map.Entry<String, Integer>> notFinishedList = roomScore.entrySet().stream()
                .filter(e -> !finishedUsers.contains(e.getKey()))
                .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()))
                .collect(Collectors.toList());

        for (Map.Entry<String, Integer> entry : notFinishedList) {
            finishOrder.add(entry.getKey());
        }

        String computedWinner = finishOrder.isEmpty() ? null : finishOrder.get(0);
        String winnerNickname = (computedWinner != null)
                ? userService.getUserInfo(computedWinner).getNickname()
                : null;

        RoomResponse response = new RoomResponse(
                roomId,
                players,
                "GAME_ENDED",
                winnerNickname,
                finishOrder,
                null
        );
        messagingTemplate.convertAndSend("/topic/room/" + roomId, response);

        log.info("Game ended via timeout for roomId: {}. Winner: {}. Final finish order: {}",
                roomId, winnerNickname, finishOrder);
    }

    /**
     * 100개의 랜덤 방향(0,1,2,3) 리스트를 생성
     */
    private List<Integer> generateRandomDirectionSequence(int count) {
        List<Integer> sequence = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            sequence.add(ThreadLocalRandom.current().nextInt(4));
        }
        return sequence;
    }

    /**
     * (8) 현재 입력이 정답인지 확인하는 메서드
     *  - roomId로 directionSequenceMap에서 방향 리스트 획득
     *  - userStepMap에서 user가 현재 몇 번째 인덱스인지 확인
     *  - 해당 인덱스의 정답과 pressedDirection을 비교
     */
    private boolean isAnswerCorrect(String roomId, String user, int pressedDirection) {
        // directionSequence 가져오기
        List<Integer> directionSeq = directionSequenceMap.get(roomId);
        if (directionSeq == null) {
            log.warn("No direction sequence for roomId={}, defaulting to false", roomId);
            return false;
        }

        // userStepMap에서 해당 유저의 현재 인덱스
        Integer currentIndex = userStepMap.getOrDefault(roomId, new ConcurrentHashMap<>()).getOrDefault(user, 0);

        // 인덱스 범위 초과면 false
        if (currentIndex >= directionSeq.size()) {
            return false;
        }

        int correctDirection = directionSeq.get(currentIndex);
        return (pressedDirection == correctDirection);
    }
}
