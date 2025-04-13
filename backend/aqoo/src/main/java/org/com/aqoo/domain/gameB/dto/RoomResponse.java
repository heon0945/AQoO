package org.com.aqoo.domain.gameB.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private String roomId;
    private List<GameBPlayerDto> players;
    /**
     * 상태 메시지 예: GAME_B_STARTED, SCORE_UPDATED, GAME_B_ENDED
     */
    private String message;
    /**
     * 게임 종료 시 승자(혹은 최고 점수자) 표시 (필요시)
     */
    private String winner;
    /**
     * 최종 점수 순서 (필요시)
     */
    private List<String> scoreOrder;
}
