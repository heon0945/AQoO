package org.com.aqoo.domain.gameA.dto;

import lombok.Data;

/**
 * 타임아웃 등으로 게임 종료 요청 시 사용됩니다.
 */
@Data
public class EndGameMessage {
    private String roomId;
}
