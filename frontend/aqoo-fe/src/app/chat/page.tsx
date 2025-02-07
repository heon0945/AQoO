"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { useRecoilState } from "recoil"; 
import { participantsState, Friend } from "@/store/participantAtom"; 

import ChatBox from "@/app/chat/ChatBox";  
import ParticipantList from "@/app/chat/ParticipnatList";

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams(); 
    const [participants, setParticipants] = useRecoilState(participantsState);
    const [hostUser, setHostUser] = useState<Friend | null>(null);
    const [userId, setUserId] = useState<string | null>(null); // ✅ 로그인된 사용자 ID 저장

    // ✅ 1️⃣ 로그인한 사용자 정보 가져오기 (백엔드 호출)
    useEffect(() => {
        fetch("http://i12e203.p.ssafy.io:8089/api/v1/users/me", {
            credentials: "include", // 세션 인증을 위한 옵션 (필요하면 추가)
        })
            .then((response) => response.json())
            .then(data => {
                if (data) {
                    setUserId(data.id); // ✅ 로그인한 사용자 ID 저장

                    const host = {
                        id: data.id,
                        nickname: data.nickname,
                        level: data.level || 1,
                        status: "READY",
                        isHost: true,
                    };
                    // setHostUser(host);
                }
            })
            .catch(error => {
                console.error("❌ 로그인한 유저 정보 가져오기 오류:", error);
            });
    }, []);

    // ✅ 2️⃣ 참가자 정보 가져오기 + 방장 추가
    useEffect(() => {
        const data = searchParams.get("data");
        if (data) {
            try {
                const parsedData: Friend[] = JSON.parse(decodeURIComponent(data));

                if (hostUser) {
                    const updatedParticipants = parsedData.some(p => p.id === hostUser.id)
                        ? parsedData
                        : [hostUser, ...parsedData];

                    setParticipants(updatedParticipants);
                } else {
                    setParticipants(parsedData);
                }

            } catch (error) {
                console.error("❌ 참가자 데이터 파싱 오류:", error);
            }
        }
    }, [searchParams, setParticipants, hostUser]); // ✅ hostUser가 변경될 때도 실행

    // ✅ 3️⃣ 방장 나가면 새로운 방장 설정
    const handleExit = () => {
        if (!hostUser) {
            return router.push("/gameroom");
        }

        setParticipants((prevParticipants) => {
            const newParticipants = prevParticipants.filter(p => p.id !== hostUser.id);

            if (newParticipants.length > 0) {
                newParticipants[0].isHOst = true; // ✅ 새로운 방장 설정
            }

            return newParticipants;
        });

        router.push("/gameroom");
    };

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
              onClick={handleExit}
              className="fixed bottom-10 left-7 px-10 py-2 rounded-lg border border-black bg-white text-2xl shadow-md hover:bg-gray-100"
            >
                나가기
            </button>
        </div>
    );
}
