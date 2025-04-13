package org.com.aqoo.domain.gameA.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 게임 진행 상태를 클라이언트에 전달할 때 사용하는 응답 DTO입니다.
 * directionSequence 필드는 0~3의 정수 100개로 구성된 랜덤 방향 리스트입니다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private String roomId;
    private List<GameAPlayerDto> players;
    private String message;
    private String winner;
    private List<String> finishOrder;
    private List<Integer> directionSequence;
}
