package org.com.aqoo.domain.gameB.dto;

import lombok.Data;

@Data
public class FoodEatenDto {
    private String roomId;
    private String userName;
    private String foodType; // "FOOD" 또는 "ROCK"
}