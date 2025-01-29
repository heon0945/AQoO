package org.com.aqoo.domain.auth.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    private String pw;
    private String email;
    private String nickname;
    private Integer mainFishId;
    private Integer exp;
    private Integer level;
    private String refreshToken;
    private Boolean status;
    private Integer mainAquarium;
}
