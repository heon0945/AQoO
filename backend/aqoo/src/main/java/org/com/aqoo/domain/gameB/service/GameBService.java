package org.com.aqoo.domain.gameB.service;

import lombok.RequiredArgsConstructor;
import org.com.aqoo.domain.gameB.dto.*;
import org.com.aqoo.domain.gameB.entity.GameSession;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameBService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    public void startGame(StartGameDto dto) {
        String roomId = dto.getRoomId();
        GameSession session = new GameSession(roomId, dto.getUserName());
        session.start();
        sessions.put(roomId, session);

        // 100초 후에 게임을 종료하도록 스케줄링
        scheduler.schedule(() -> endGame(roomId), 100, TimeUnit.SECONDS);
    }

    public void processPlayerMove(PlayerMoveDto dto) {
        GameSession session = sessions.get(dto.getRoomId());
        if (session != null) {
            session.updatePlayerDirection(dto.getUserName(), dto.getDirection());
            // 이동 시 상태 업데이트가 필요한 경우 아래 주석 해제
            // broadcastGameState(dto.getRoomId());
        }
    }

    public void processFoodEaten(FoodEatenDto dto) {
        GameSession session = sessions.get(dto.getRoomId());
        if (session != null) {
            if ("FOOD".equals(dto.getFoodType())) {
                session.addScore(dto.getUserName(), 10);
            } else if ("ROCK".equals(dto.getFoodType())) {
                session.applyStun(dto.getUserName(), 1); // 1초간 스턴
            }
            // 플레이어 점수 또는 상태가 변화한 경우 업데이트 브로드캐스트
            broadcastGameState(dto.getRoomId());
        }
    }

    private void broadcastGameState(String roomId) {
        GameSession session = sessions.get(roomId);
        if (session != null) {
            GameStateUpdateDto update = new GameStateUpdateDto();
            update.setRoomId(roomId);
            update.setRemainingTime(session.getRemainingTime());
            List<GamePlayerDto> playerStates = session.getPlayers().stream().map(player -> {
                GamePlayerDto dto = new GamePlayerDto();
                dto.setUserName(player.getUserName());
                dto.setScore(player.getScore());
                dto.setDirection(player.getDirection());
                dto.setStunned(player.isStunned());
                return dto;
            }).collect(Collectors.toList());
            update.setPlayerStates(playerStates);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, update);
        }
    }

    private void endGame(String roomId) {
        GameSession session = sessions.remove(roomId);
        if (session != null) {
            session.end();
            List<GamePlayerDto> ranking = session.getPlayers().stream()
                    .sorted((p1, p2) -> p2.getScore() - p1.getScore())
                    .map(player -> {
                        GamePlayerDto dto = new GamePlayerDto();
                        dto.setUserName(player.getUserName());
                        dto.setScore(player.getScore());
                        dto.setDirection(player.getDirection());
                        dto.setStunned(player.isStunned());
                        return dto;
                    }).collect(Collectors.toList());
            FinalResultDto result = new FinalResultDto();
            result.setRoomId(roomId);
            result.setRanking(ranking);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, result);
        }
    }
}