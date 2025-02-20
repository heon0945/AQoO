package org.com.aqoo.domain.gameA.controller;

import lombok.RequiredArgsConstructor;
import org.com.aqoo.domain.gameA.dto.EndGameMessage;
import org.com.aqoo.domain.gameA.dto.PressMessage;
import org.com.aqoo.domain.gameA.dto.StartGameMessage;
import org.com.aqoo.domain.gameA.service.GameAService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameAController {

    private final GameAService gameAService;

    /**
     * 게임 시작 요청 처리  
     * 클라이언트는 /app/gameA.start 로 메시지를 전송
     */
    @MessageMapping("/gameA.start")
    public void startGame(@Payload StartGameMessage message) {
        System.out.println("gameA.start received: " + message);
        gameAService.startGame(message.getRoomId());
    }

    /**
     * 방향키 입력 이벤트 처리  
     * 클라이언트는 /app/gameA.press 로 메시지를 전송  
     * PressMessage에는 roomId, userName, 그리고 direction (입력한 방향: 0, 1, 2, 3)이 포함되어야 함
     */
    @MessageMapping("/gameA.press")
    public void press(@Payload PressMessage message) {
        System.out.println("gameA.press received: " + message);
        gameAService.processPress(message);
    }

    /**
     * 타임아웃 등으로 게임 종료 요청 처리  
     * 클라이언트는 /app/gameA.end 로 메시지를 전송
     */
    @MessageMapping("/gameA.end")
    public void endGame(@Payload EndGameMessage message) {
        System.out.println("gameA.end received: " + message);
        gameAService.endGame(message.getRoomId());
    }
}
