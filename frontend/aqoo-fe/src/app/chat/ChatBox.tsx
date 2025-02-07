// 채팅창 컴포넌트

'use client';

import { useRecoilState } from "recoil";
import { participantsState } from "@/store/participantAtom";
import { chatMessagesState } from "@/store/chatAtom";
import { useInput } from "@/hooks/useInput"; // 커스텀 훅 사용
import Message from "./Message"; 

export default function ChatBox() {
  const [participants] = useRecoilState(participantsState);
  const [messages, setMessages] = useRecoilState(chatMessagesState);
  const input = useInput(""); // useState 대신 커스텀 훅 사용

  //  현재 유저 정보 넘김
  const currentUser = participants.length > 0 ? participants[0] : null;

  const sendMessage = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (input.value.trim() === "") return;

    const newMessage = {
      id: String(Date.now()),
      sender: currentUser.nickname, 
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
          disabled={!currentUser} // 참가자 아니면 비활성화
        />
        <button 
          className="px-4 bg-white border-l border-black text-black hover:bg-gray-200"
          onClick={sendMessage}
          disabled={!currentUser} // 참가자 아니면 비활성화
        >
          전송
        </button>
      </div>
    </div>
  );
}
