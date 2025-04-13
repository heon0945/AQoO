package org.com.aqoo.domain.gameA.dto;

import lombok.Data;

/**
 * gameA 시작 요청 시 사용됩니다.
 */
@Data
public class StartGameMessage {
    private String roomId;
}
