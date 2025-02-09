"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { RecoilRoot, useRecoilValue } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { participantsState, Friend } from "@/store/participantAtom";

import FriendList from "@/app/gameroom/FriendList";
import ParticipantList from "@/app/gameroom/ParticipantList";

const API_BASE_URL = "http://i12e203.p.ssafy.io:8089/api/v1";

export default function GameRoom() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <RoomCreationScreen />
      </RecoilRoot>
    </QueryClientProvider>
  );
}

function RoomCreationScreen() {
  const participants = useRecoilValue(participantsState);
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (participants.length === 0) {
      alert("⚠ 참가자가 없습니다! 최소 1명 이상 추가해주세요.");
      return;
    }
  
    try {
      console.log("🚀 [TEST] 채팅방 생성 요청 시작 (실제 API 없음)");
  
      // ✅ 1️⃣ 가짜 채팅방 ID 생성 (실제 API가 없으므로)
      const fakeRoomId = `test_room_${Date.now()}`;
      console.log("✅ [TEST] 채팅방 생성 성공, Room ID:", fakeRoomId);
  
      // ✅ 2️⃣ 가짜 친구 초대 처리 (실제 API 없음)
      const invitedUsers = participants.slice(1).map((friend) => friend.id);
      console.log("✅ [TEST] 친구 초대 완료:", invitedUsers);
  
      // ✅ 3️⃣ 채팅방으로 이동 (가짜 Room ID 사용)
      const encodedData = encodeURIComponent(JSON.stringify(participants));
      router.push(`/chat?data=${encodedData}&roomId=${fakeRoomId}`);
  
    } catch (error) {
      console.error("❌ [TEST] 채팅방 생성 또는 초대 실패", error);
      alert("테스트 환경에서 채팅방을 생성하는 데 실패했습니다.");
    }
  };
  

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.png')" }}
    >
      <div className="absolute inset-0 bg-white opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-6 text-black">🎮 방 만들기 🕹️</h1>
        <div className="flex gap-6">
          <FriendList />
          <ParticipantList />
        </div>
      </div>

      <button
        className="fixed bottom-10 right-7 px-10 py-2 rounded-lg border border-black bg-white text-2xl shadow-md hover:bg-gray-100"
        onClick={handleCreateRoom}
      >
        만들기
      </button>

      <button
        className="fixed bottom-10 left-7 px-10 py-2 rounded-lg border border-black bg-white text-2xl shadow-md hover:bg-gray-100"
        onClick={() => router.push("/")}
      >
        BACK
      </button>
    </div>
  );
}
