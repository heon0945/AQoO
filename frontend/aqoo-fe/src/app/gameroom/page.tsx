"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { usersState } from "@/store/participantAtom";
import FriendList from "./FriendList";
import ParticipantList from "./ParticipantList";

export default function GameRoomPage() {
  const [participants, setParticipants] = useRecoilState(usersState);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null); // ✅ 초기값을 null로 설정

  // ✅ 사용자 이름을 가져와 설정하는 useEffect 추가
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("loggedInUser") || "guest";
      setUserName(storedUserName);
    }
  }, []);

  // ✅ 방장 자동 지정 (이전 참가자가 있을 경우만)
  useEffect(() => {
    if (participants.length > 0 && !participants[0]?.isHost) {
      setParticipants((prev) => {
        const updatedParticipants = [...prev];
        updatedParticipants[0] = { ...updatedParticipants[0], isHost: true };
        return updatedParticipants;
      });
    }
  }, [participants.length]); // ✅ 무한 렌더링 방지

  // ✅ 채팅방 생성 핸들러
  const handleCreateRoom = async () => {
    if (participants.length === 0) {
      alert("⚠ 참가자를 한 명 이상 추가해주세요.");
      return;
    }

    if (!userName) {
      alert("⚠ 사용자 이름을 확인할 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://i12e203.p.ssafy.io/api/v1/chatrooms?userId=${encodeURIComponent(userName)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Room creation failed");
      }

      const data = await response.json();
      const roomId = data.roomId;
      console.log("✅ Created roomId:", roomId);

      // ✅ 새로운 경로로 이동
      router.push(
        `/room/${roomId}?userName=${encodeURIComponent(userName)}&isHost=true`
      );
    } catch (error) {
      console.error("❌ Error creating room:", error);
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류 발생";
      alert(`채팅방 생성 실패: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen">
      {/* 배경 이미지 div */}
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/images/background.png')] opacity-80"></div>
  
      {/* 내부 콘텐츠 영역 */}
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
          🎮 방 만들기 🕹️
        </h1>
  
        <div className="flex gap-6">
          <FriendList />
          <ParticipantList />
        </div>
  
        <button
          onClick={handleCreateRoom}
          disabled={!userName || participants.length === 0 || loading}
          className="mt-6 w-60 px-4 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "채팅방 생성"}
        </button>
      </div>
    </div>
  );
  
  
}
