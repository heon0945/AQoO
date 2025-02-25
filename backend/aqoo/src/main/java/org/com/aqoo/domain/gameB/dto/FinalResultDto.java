package org.com.aqoo.domain.gameB.dto;

import lombok.Data;
import java.util.List;

@Data
public class FinalResultDto {
    private String roomId;
    private List<GamePlayerDto> ranking;
    // 메시지 타입을 명시하는 필드 추가 (예: "GAME_ENDED")
    private String message;
}