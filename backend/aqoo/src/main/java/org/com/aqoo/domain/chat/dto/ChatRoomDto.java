package org.com.aqoo.domain.chat.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class ChatRoomDto {
    private String roomId;  // 채팅방 ID
    private String name;    // 채팅방 이름
    private Set<String> members; // 채팅방 멤버 목록

    public ChatRoomDto(String roomId, String name, Set<String> members) {
        this.roomId = roomId;
        this.name = name;
        this.members = members;
    }
}
