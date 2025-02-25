package org.com.aqoo.domain.gameB.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameBPlayerDto {
    private String userName;
    private int score;
    private String mainFishImage;
    private String nickname;
}
