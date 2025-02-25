package org.com.aqoo.domain.gameB.dto;

import lombok.Data;

@Data
public class StartGameDto {
    private String roomId;
    private String userName;
    private String gameType; // 예: "GameB"
}