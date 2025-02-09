"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { useRecoilState } from "recoil"; 
import { participantsState, Friend } from "@/store/participantAtom"; 

import ChatBox from "@/app/chat/ChatBox";  
import ParticipantList from "@/app/chat/ParticipnatList";

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams(); 
    const [participants, setParticipants] = useRecoilState(participantsState);  // ✅ 수정

    // ✅ 테스트 모드 설정 (임시 유저 추가)
    const TEST_MODE = true;
    const TEST_USER: Friend = {
      id: "eejj",
      friendId: "eejj",  // ✅ 필드 추가
      nickname: "테스트 유저",
      level: 1,
    };

    useEffect(() => {
        const data = searchParams.get("data");
        console.log("받아온 참가자 데이터 (URL):", data);

        if (data) {
            try {
                const parsedData: Friend[] = JSON.parse(decodeURIComponent(data));
                console.log("파싱된 참가자 데이터:", parsedData);

                if (parsedData.length === 0 && TEST_MODE) {
                  console.log("⚠ 참가자가 없음. 테스트 유저 추가!");
                  setParticipants((prev) => [...prev, TEST_USER]);  // ✅ 기존 값 유지하면서 추가
                } else {
                  setParticipants((prev) => [...prev, ...parsedData]);  // ✅ 기존 값 유지하면서 추가
                }
                
            } catch (error) {
                console.error("❌ 참가자 데이터 파싱 오류:", error);
            }
        } else if (TEST_MODE) {
            console.log("⚠ 참가자 데이터가 없음. 테스트 유저 추가!");
            setParticipants([TEST_USER]);
        }
    }, [searchParams, setParticipants]);

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
