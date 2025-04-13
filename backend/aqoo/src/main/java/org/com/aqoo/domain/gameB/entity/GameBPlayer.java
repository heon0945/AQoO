package org.com.aqoo.domain.gameB.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameBPlayer {
    private String roomId;
    private String userName;
    private int score;
    /**
     * 스턴 해제 시각 (ms)
     */
    private long stunEndTime;
}
