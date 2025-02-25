package org.com.aqoo.domain.gameB.dto;

import lombok.Data;

import java.util.List;

@Data
public class GameStateUpdateDto {
    private String roomId;
    private int remainingTime;
    private List<GamePlayerDto> playerStates;
}