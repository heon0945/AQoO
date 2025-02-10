"use client";

import { useEffect, useState } from "react"; // ✅ useEffect, useState 추가
import { useRouter, useSearchParams } from "next/navigation"; 
import { useRecoilState } from "recoil"; 
import { usersState, User } from "@/store/participantAtom"; 

import ChatBox from "@/app/chat/ChatBox";  
import ParticipantList from "@/app/chat/ParticipantList"; // ✅ 파일명 오타 수정

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams(); 
    const [participants, setParticipants] = useRecoilState(usersState);  

    // ✅ 테스트 모드 설정
    const TEST_MODE = true;
    const TEST_USER: User = {
      id: "eejj",
      friendId: "eejj",
      nickname: "테스트 유저",
      level: 1,
      ready: false,
      isHost: false,
    };

    useEffect(() => {
        const data = searchParams.get("data");
        console.log("받아온 참가자 데이터 (URL):", data);

        if (data) {
            try {
                const parsedData: User[] = JSON.parse(decodeURIComponent(data));
                console.log("파싱된 참가자 데이터:", parsedData);

                if (parsedData.length === 0 && TEST_MODE) {
                  console.log("⚠ 참가자가 없음. 테스트 유저 추가!");
                  setParticipants((prev) => [...prev, TEST_USER]);  
                } else {
                  setParticipants((prev) => [...prev, ...parsedData]);  
                }
                
            } catch (error) {
                console.error("❌ 참가자 데이터 파싱 오류:", error);
            }
        } else if (TEST_MODE) {
            console.log("⚠ 참가자 데이터가 없음. 테스트 유저 추가!");
            setParticipants([TEST_USER]);
        }
    }, [searchParams, setParticipants]); // ✅ 의존성 배열 확인

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
