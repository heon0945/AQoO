package org.com.aqoo.domain.gameB.dto;

import lombok.Data;

@Data
public class PlayerMoveDto {
    private String roomId;
    private String userName;
    private String direction; // "LEFT", "RIGHT", "IDLE" 등
}