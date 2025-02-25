package org.com.aqoo.domain.gameB.dto;

import lombok.Data;

@Data
public class GamePlayerDto {
    private String userName;
    private int score;
    private String direction;
    private boolean stunned;
}