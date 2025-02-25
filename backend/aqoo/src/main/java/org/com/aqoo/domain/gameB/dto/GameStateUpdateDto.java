package org.com.aqoo.domain.gameB.dto;

import lombok.Data;
import java.util.List;

@Data
public class GameStateUpdateDto {
    private String roomId;
    private int remainingTime;
    private List<GamePlayerDto> playerStates;
    // 메시지 타입을 명시하는 필드 추가 (예: "GAME_STATE_UPDATE")
    private String message;
}