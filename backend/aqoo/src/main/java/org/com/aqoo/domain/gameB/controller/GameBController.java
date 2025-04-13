package org.com.aqoo.domain.gameB.controller;

import lombok.RequiredArgsConstructor;
import org.com.aqoo.domain.gameB.dto.EndGameMessage;
import org.com.aqoo.domain.gameB.dto.EatMessage;
import org.com.aqoo.domain.gameB.dto.StartGameMessage;
import org.com.aqoo.domain.gameB.service.GameBService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameBController {

    private final GameBService gameBService;

    /**
     * 게임 시작 요청 처리
     * 클라이언트는 /app/gameB.start 로 메시지를 전송
     */
    @MessageMapping("/gameB.start")
    public void startGame(@Payload StartGameMessage message) {
        // 게임 시작 처리
        gameBService.startGame(message.getRoomId());
    }

    /**
     * 먹이/돌 섭취 이벤트 처리
     * 클라이언트는 /app/gameB.eat 로 메시지를 전송
     * EatMessage에는 roomId, userName, itemType (FEED, STONE) 정보가 포함됨
     */
    @MessageMapping("/gameB.eat")
    public void processEat(@Payload EatMessage message) {
        gameBService.processEat(message);
    }

    /**
     * 타임아웃 등으로 게임 종료 요청 처리
     * 클라이언트는 /app/gameB.end 로 메시지를 전송
     */
    @MessageMapping("/gameB.end")
    public void endGame(@Payload EndGameMessage message) {
        gameBService.endGame(message.getRoomId());
    }
}
