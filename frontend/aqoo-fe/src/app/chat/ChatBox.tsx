'use client';

import { useRecoilState } from "recoil";
import { chatMessagesState } from "@/store/chatAtom";
import { useInput } from "@/hooks/useInput"; // 커스텀 훅 사용
import Message from "./Message"; 

export default function ChatBox() {
  const [messages, setMessages] = useRecoilState(chatMessagesState);
  const input = useInput(""); // useState 대신 커스텀 훅 사용

  const sendMessage = () => {
    if (input.value.trim() === "") return;
    const newMessage = {
      id: String(Date.now()),
      sender: "닉네임", 
      text: input.value, 
      timestamp: Date.now()
    };
    setMessages([...messages, newMessage]);
    input.onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>); // 입력창 초기화
  };

  return (
    <div className="flex flex-col w-[400px] h-[300px] bg-white bg-opacity-80 border border-black rounded-lg p-4 shadow-md">
      {/* 채팅 메시지 목록 */}
      <div className="h-[220px] overflow-y-auto space-y-2 p-2">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
      </div>

      {/* 메시지 입력창 & 전송 버튼 */}
      <div className="flex mt-2 border border-black rounded-lg overflow-hidden">
        <input
          type="text"
          className="flex-1 p-2 border-none outline-none bg-white placeholder-gray-500 text-black"
          placeholder="메시지를 입력하세요."
          {...input} // 커스텀 훅 사용
        />
        <button 
          className="px-4 bg-white border-l border-black text-black hover:bg-gray-200"
          onClick={sendMessage}
        >
          전송
        </button>
      </div>
    </div>
  );
}
