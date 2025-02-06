"use client";

import { useEffect } from "react";
import ChatBox from "@/app/chat/ChatBox";  
import ParticipantList from "@/app/chat/ParticipnatList";
import { useRouter } from "next/navigation"; 
import { useRecoilState } from "recoil"; 
import { participantsState, Friend } from "@/store/participantAtom"; 

export default function ChatPage() {
    const router = useRouter();
    const [participants, setParticipants] = useRecoilState(participantsState);

    useEffect(() => {
        // ✅ 페이지 로드 시 `sessionStorage`에서 참가자 리스트 불러오기
        const savedParticipants = sessionStorage.getItem("participants");
        if (savedParticipants) {
            setParticipants(JSON.parse(savedParticipants) as Friend[]);
        }
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-6"
             style={{ backgroundImage: "url('/images/background.png')" }}>

            {/* 참가자 리스트 */}
            <div className="absolute top-4 right-4">
                <ParticipantList />
            </div>

            {/* 채팅방 */}
            <div className="bg-white bg-opacity-80 border border-gray-300 rounded-lg p-4 w-[400px] shadow-md">
                <ChatBox />
            </div>

            {/* 나가기 버튼 */}
            <button
              onClick={() => router.push("/gameroom")}
              className="fixed bottom-10 left-7 px-10 py-2 rounded-lg border border-black bg-white text-2xl shadow-md hover:bg-gray-100"
            >
                나가기
            </button>
        </div>
    );
}
