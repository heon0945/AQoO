package org.com.aqoo.domain.chat.service;

import org.com.aqoo.domain.chat.model.ChatRoom;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatRoomService {
    private final Map<String, ChatRoom> chatRooms = new ConcurrentHashMap<>();

    /** 모든 채팅방 목록 조회 */
    public List<ChatRoom> getAllRooms() {
        return List.copyOf(chatRooms.values());
    }

    /** 채팅방 생성 */
    public ChatRoom createRoom(String name) {
        String roomId = UUID.randomUUID().toString(); // ✅ UUID 기반 ID 생성
        ChatRoom room = new ChatRoom(roomId, name);
        chatRooms.put(roomId, room);
        return room;
    }

    /** 특정 채팅방 조회 */
    public ChatRoom getRoom(String roomId) {
        return chatRooms.getOrDefault(roomId, new ChatRoom(roomId, "Unknown Room"));
    }

    /** 채팅방 삭제 */
    public void deleteRoom(String roomId) {
        chatRooms.remove(roomId);
    }
}
