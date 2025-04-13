package org.com.aqoo.domain.gameB.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EatMessage {
    private String roomId;
    private String userName;
    /**
     * itemType: "FEED"이면 점수 증가, "STONE"이면 1초 스턴
     */
    private String itemType;
}
