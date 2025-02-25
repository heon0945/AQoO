package org.com.aqoo.domain.gameB.dto;

import lombok.Data;

import java.util.List;

@Data
public class FinalResultDto {
    private String roomId;
    private List<GamePlayerDto> ranking;
}