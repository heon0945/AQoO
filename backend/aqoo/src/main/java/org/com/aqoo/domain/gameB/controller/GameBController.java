package org.com.aqoo.domain.gameB.controller;

import lombok.RequiredArgsConstructor;
import org.com.aqoo.domain.gameB.dto.FoodEatenDto;
import org.com.aqoo.domain.gameB.dto.PlayerMoveDto;
import org.com.aqoo.domain.gameB.dto.StartGameDto;
import org.com.aqoo.domain.gameB.service.GameBService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameBController {

    private final GameBService gameBService;

    @MessageMapping("/gameB.start")
    public void startGame(@Payload StartGameDto startGameDto) {
        gameBService.startGame(startGameDto);
    }

    @MessageMapping("/gameB.move")
    public void playerMove(@Payload PlayerMoveDto moveDto) {
        gameBService.processPlayerMove(moveDto);
    }

    @MessageMapping("/gameB.foodEaten")
    public void foodEaten(@Payload FoodEatenDto foodEatenDto) {
        gameBService.processFoodEaten(foodEatenDto);
    }
}