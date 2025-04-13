package org.com.aqoo.domain.gameA.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * gameA의 플레이어 상태를 표현하는 엔티티입니다.
 * (게임 로직 상 일회용 객체로 사용할 수도 있으며, 별도의 DB 저장 대상이 아니라면 단순 POJO로도 충분합니다.)
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameAPlayer {
    private String userName;
    private int totalPressCount;
    private String mainFishImage;
    private String nickname;
}
