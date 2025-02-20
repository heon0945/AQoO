package org.com.aqoo.domain.gameA.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 게임 내 플레이어 정보를 담는 DTO입니다.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameAPlayerDto {
    private String userName;
    private int score;
    private String mainFishImage;
    private String nickname;
}
