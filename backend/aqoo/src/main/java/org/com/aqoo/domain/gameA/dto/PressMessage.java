package org.com.aqoo.domain.gameA.dto;

import lombok.Data;

/**
 * 플레이어가 방향키를 눌렀을 때 전송할 메시지입니다.
 * direction 필드는 0, 1, 2, 3의 값으로 (예: 0: UP, 1: RIGHT, 2: DOWN, 3: LEFT) 표현합니다.
 */
@Data
public class PressMessage {
    private String roomId;
    private String userName;
    private int direction;
}
