package org.com.aqoo.domain.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String sender;  // 메시지 보낸 유저
    private String content; // 메시지 내용
    private long timestamp; // 전송 시간
}
