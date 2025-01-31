package org.com.aqoo.domain.chat.dto;

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ConcurrentSkipListSet;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    private String roomId; // 방 ID
    private ConcurrentSkipListSet<String> members = new ConcurrentSkipListSet<>(); // 방 멤버 목록
}
