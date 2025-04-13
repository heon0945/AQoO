"use client";

import { getStompClient } from "@/lib/stompclient";
import { useEffect, useRef, useState } from "react";
import { useSFX } from "@/hooks/useSFX";

interface ChatMessage {
  roomId: string;
  sender: string;
  content: string;
  type: "CHAT" | "JOIN" | "LEAVE" | "READY" | "USER_KICKED";
}

interface ChatBoxProps {
  roomId: string;
  users: { userName: string; nickname: string }[];
  currentUser: { id: string; nickname: string; level?: number };
  onNewMessage: (sender: string, message: string) => void;
}

export default function ChatBox({
  roomId,
  users,
  currentUser,
  onNewMessage,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { play: playModal } = useSFX("/sounds/clickeffect-02.mp3");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 웹소켓 구독
  useEffect(() => {
    const client = getStompClient();
    if (client) {
      const subscription = client.subscribe(`/topic/${roomId}`, (messageFrame) => {
        const incoming: ChatMessage = JSON.parse(messageFrame.body);

        // 모든 메시지를 state에 추가
        setMessages((prev) => [...prev, incoming]);

        // 일반 메시지면 onNewMessage 호출
        if (incoming.type === "CHAT") {
          onNewMessage(incoming.sender, incoming.content);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [roomId]);

  // 메시지 전송
  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const client = getStompClient();
    if (client && client.connected) {
      const chatMessage: ChatMessage = {
        roomId,
        sender: currentUser.nickname,
        content: newMessage,
        type: "CHAT",
      };
      client.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(chatMessage),
      });
      setNewMessage("");
    } else {
      // 연결 안 된 경우 임시로 state에 추가
      setMessages((prev) => [
        ...prev,
        {
          roomId,
          sender: currentUser.nickname,
          content: newMessage,
          type: "CHAT",
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="sm:border rounded sm:p-3 p-1 sm:bg-white flex flex-col w-full h-full ">
      <div className="flex-grow overflow-y-auto min-h-0 sm:p-4 p-2 custom-scrollbar">
        {messages.map((msg, index) => {
          // 시스템 메시지
          if (
            msg.sender === "SYSTEM" &&
            ["JOIN", "LEAVE", "READY", "USER_KICKED"].includes(msg.type)
          ) {
            return (
              <div key={index} className="mb-2 text-center text-gray-500 italic">
                {msg.content}
              </div>
            );
          }

          // 일반 메시지
          const isMyMessage = msg.sender === currentUser.nickname;
          // 이전 메시지와 sender가 다른 경우에만 닉네임 표시
          const isFirstMessage = index === 0;
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const isDifferentSender =
            prevMsg === null || prevMsg.sender !== msg.sender;

          return (
            <div
              key={index}
              className={`mb-4 ${isMyMessage ? "text-right" : "text-left"}`}
            >
              {/* 같은 사람이 연속으로 쓴 메시지가 아니라면 닉네임 표시 */}
              {!isMyMessage && (isFirstMessage || isDifferentSender) && (
                <p className="sm:text-sm text-xs sm:text-gray-600 text-gray-300 mb-2">
                  {msg.sender}
                </p>
              )}
              <span className="sm:text-base text-sm bg-gray-100 p-2">
                {msg.content}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center rounded-lg scrollbar-hide">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="채팅을 입력해 주세요"
          className="
            flex-grow p-3 bg-gray-50 sm:text-sm text-xs
            border border-gray-300
            focus:outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-200
            transition-colors
          "
        />
        <button
          onClick={() => {
            playModal();
            sendMessage();
          }}
          className="w-[25%] p-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          보내기
        </button>
      </div>
    </div>
  );
}
