package org.com.aqoo.domain.chat.controller;

import lombok.RequiredArgsConstructor;
import org.com.aqoo.domain.chat.dto.ChatRoom;
import org.com.aqoo.domain.chat.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;


@RestController
@RequestMapping("/api/v1/chatrooms")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    // 채팅방 생성
    @PostMapping("/create")
    public ChatRoom createRoom(@RequestBody Map<String,String> request) {
        String userId = request.get("userId");
        return chatService.createRoom(userId);
    }
}
