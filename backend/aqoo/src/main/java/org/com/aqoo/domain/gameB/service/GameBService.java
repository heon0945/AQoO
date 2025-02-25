package org.com.aqoo.domain.gameB.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.com.aqoo.domain.auth.dto.UserInfoResponse;
import org.com.aqoo.domain.auth.service.UserService;
import org.com.aqoo.domain.chat.model.ChatRoom;
import org.com.aqoo.domain.chat.service.ChatRoomService;
import org.com.aqoo.domain.gameB.dto.EatMessage;
import org.com.aqoo.domain.gameB.dto.GameBPlayerDto;
import org.com.aqoo.domain.gameB.dto.RoomResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Slf4j
@AllArgsConstructor
public class GameBService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomService chatRoomService;
    private final UserService userService;

    /**
     * 각 방의 점수를 관리하는 Map: roomId -> (userName -> score)
     */
    private final Map<String, Map<String, Integer>> scoreMap = new ConcurrentHashMap<>();

    /**
     * 각 방의 스턴 상태 관리: roomId -> (userName -> stunEndTime)
     */
    private final Map<String, Map<String, Long>> stunMap = new ConcurrentHashMap<>();

    /**
     * 게임 시작: 채팅방 멤버의 점수를 0으로 초기화하고, GAME_B_STARTED 메시지를 브로드캐스트
     */
    @Transactional
    public void startGame(String roomId) {
        log.info("startGame() called for roomId: {}", roomId);
        ChatRoom chatRoom = chatRoomService.getRoom(roomId);
        if (chatRoom != null) {
            Map<String, Integer> roomScore = new ConcurrentHashMap<>();
            chatRoom.getMembers().forEach(member -> roomScore.put(member, 0));
            scoreMap.put(roomId, roomScore);
            // 스턴 상태 초기화
            stunMap.put(roomId, new ConcurrentHashMap<>());

            List<GameBPlayerDto> players = roomScore.entrySet().stream()
                    .map(e -> {
                        String userName = e.getKey();
                        int score = e.getValue();
                        UserInfoResponse userInfo = userService.getUserInfo(userName);
                        return new GameBPlayerDto(userName, score, userInfo.getMainFishImage(), userInfo.getNickname());
                    })
                    .collect(Collectors.toList());

            RoomResponse response = new RoomResponse(roomId, players, "GAME_B_STARTED", null, null);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
            log.info("Broadcasted GAME_B_STARTED for roomId: {}", roomId);
        } else {
            log.error("ChatRoom not found for roomId: {}", roomId);
        }
    }

    /**
     * 먹이/돌 섭취 이벤트 처리
     * - itemType이 "FEED"이면 점수 +1
     * - itemType이 "STONE"이면 1초 스턴 처리 (해당 시간 동안 추가 입력 무시)
     * 점수 변경 시 전체 브로드캐스트로 업데이트
     */
    @Transactional
    public void processEat(EatMessage eatMessage) {
        String roomId = eatMessage.getRoomId();
        String user = eatMessage.getUserName();
        String itemType = eatMessage.getItemType();

        log.info("processEat() called: roomId={}, userName={}, itemType={}", roomId, user, itemType);

        Map<String, Integer> roomScore = scoreMap.get(roomId);
        Map<String, Long> roomStunMap = stunMap.get(roomId);

        if (roomScore == null || roomStunMap == null) {
            log.error("No score or stun map found for roomId: {}", roomId);
            return;
        }

        long currentTime = System.currentTimeMillis();

        // 스턴 상태 체크
        if (roomStunMap.containsKey(user)) {
            long stunEnd = roomStunMap.get(user);
            if (currentTime < stunEnd) {
                log.info("User {} is stunned until {}. Ignoring eat event.", user, stunEnd);
                return;
            } else {
                roomStunMap.remove(user);
            }
        }

        if ("FEED".equalsIgnoreCase(itemType)) {
            // 먹이를 먹으면 점수 +1
            roomScore.merge(user, 1, Integer::sum);
            log.info("User {} score increased to {}", user, roomScore.get(user));
        } else if ("STONE".equalsIgnoreCase(itemType)) {
            // 돌을 먹으면 1초 스턴
            roomStunMap.put(user, currentTime + TimeUnit.SECONDS.toMillis(1));
            log.info("User {} stunned for 1 second", user);
        }

        // 플레이어 목록 업데이트 및 브로드캐스트
        List<GameBPlayerDto> players = roomScore.entrySet().stream()
                .map(e -> {
                    String userName = e.getKey();
                    int score = e.getValue();
                    UserInfoResponse userInfo = userService.getUserInfo(userName);
                    return new GameBPlayerDto(userName, score, userInfo.getMainFishImage(), userInfo.getNickname());
                })
                .collect(Collectors.toList());

        RoomResponse response = new RoomResponse(roomId, players, "SCORE_UPDATED", null, null);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
    }

    /**
     * 타임아웃 등으로 게임 종료 요청 처리
     * 게임 종료 시 최종 점수 및 승자(최고 점수자)를 브로드캐스트
     */
    @Transactional
    public void endGame(String roomId) {
        log.info("endGame() called for roomId: {}", roomId);
        Map<String, Integer> roomScore = scoreMap.get(roomId);
        if (roomScore == null) {
            log.error("No score map found for roomId: {}", roomId);
            return;
        }

        // 플레이어 목록 구성
        List<GameBPlayerDto> players = roomScore.entrySet().stream()
                .map(e -> {
                    String userName = e.getKey();
                    int score = e.getValue();
                    UserInfoResponse userInfo = userService.getUserInfo(userName);
                    return new GameBPlayerDto(userName, score, userInfo.getMainFishImage(), userInfo.getNickname());
                })
                .collect(Collectors.toList());

        // 최고 점수자 산출 (여러 명이면 최초 등록된 순서)
        Optional<Map.Entry<String, Integer>> winnerEntry = roomScore.entrySet().stream()
                .max(Comparator.comparingInt(Map.Entry::getValue));

        String winner = winnerEntry.map(Map.Entry::getKey).orElse(null);

        // 최종 점수 순서 구성: 각 항목은 "닉네임 - 점수점" 형태의 문자열
        List<String> scoreOrder = players.stream()
                .sorted((p1, p2) -> Integer.compare(p2.getScore(), p1.getScore()))
                .map(p -> p.getNickname() + " - " + p.getScore() + "점")
                .collect(Collectors.toList());

        RoomResponse response = new RoomResponse(roomId, players, "GAME_B_ENDED", winner, scoreOrder);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, response);
        log.info("Broadcasted GAME_B_ENDED for roomId: {} with winner: {}", roomId, winner);
    }

}
