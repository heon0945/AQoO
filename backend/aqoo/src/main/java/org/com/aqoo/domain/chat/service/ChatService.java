package org.com.aqoo.domain.chat.service;

import org.com.aqoo.domain.chat.dto.ChatRoom;
import org.com.aqoo.domain.chat.dto.Message;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ConcurrentSkipListSet;

@Service
public class ChatService
{
    private final ConcurrentHashMap<String, ChatRoom> chatRooms = new ConcurrentHashMap<>();

    // ✅ 채팅방 멤버 저장 (In-Memory)
    private final ConcurrentHashMap<String, ConcurrentSkipListSet<String>> roomMembers = new ConcurrentHashMap<>();

    // ✅ 채팅 메시지 저장 (In-Memory, 최근 100개만 저장 가능)
    private final ConcurrentHashMap<String, ConcurrentLinkedQueue<Message>> chatMessages = new ConcurrentHashMap<>();

    // 📌 1. 채팅방 생성
    public ChatRoom createRoom(String userId) {
        String roomId = UUID.randomUUID().toString();

        // 채팅방 생성
        ChatRoom room = new ChatRoom(roomId, new ConcurrentSkipListSet<>()); // ✅ Set 사용
        chatRooms.put(roomId, room);

        // 멤버 목록 생성 후 방장 추가
        room.getMembers().add(userId);

        // 채팅 메시지 목록 초기화
        chatMessages.put(roomId, new ConcurrentLinkedQueue<>());

        return room;
    }
}
