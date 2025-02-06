'use client';

import { useState } from "react";
import { RecoilRoot, useRecoilValue } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // 뒤로가기 버튼 기능 추가
import { participantsState } from "@/store/participantAtom"; // 참가자 상태 가져오기


import FriendList from "@/app/gameroom/FriendList";
import ParticipantList from "@/app/gameroom/ParticipantList";

export default function GameRoom() {
  // Query Client 생성
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <RoomCreationScreen />
      </RecoilRoot>
    </QueryClientProvider>
  );
}

// 방 생성 컴포넌트 (Recoil 상태 사용)
function RoomCreationScreen() {
  const participants = useRecoilValue(participantsState);
  const router = useRouter(); // 뒤로가기

  const handleCreateRoom = () => {
    if (participants.length === 0) {
      alert("⚠ 참가자가 없습니다! 최소 1명 이상 추가해주세요.");
      return;
    }

    // 내 정보(방장) 추가
    const myInfo = {

    }

    sessionStorage.setItem("participants", JSON.stringify(participants));

    // 참가자 있으면 채팅방으로 이동
    router.push("/chat");
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.png')" }}
    >
      {/* 투명도 있는 배경 오버레이 */}
      <div className="absolute inset-0 bg-white opacity-20"></div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-6 text-black">🎮 방 만들기 🕹️</h1>
        <div className="flex gap-6">
          <FriendList />
          <ParticipantList />
        </div>
      </div>

      {/* 방 만들기 버튼 */}
      <button
        className="fixed bottom-10 right-7 px-10 py-2 rounded-lg border border-black bg-white text-2xl shadow-md hover:bg-gray-100"
        onClick={handleCreateRoom}
      >
        만들기
      </button>

      {/* 뒤로가기 버튼 (메인페이지로로 이동) */}
      <button
        className="fixed bottom-10 left-7 px-10 py-2 rounded-lg border border-black bg-white text-2xl shadow-md hover:bg-gray-100"
        onClick={() => router.push("/")}
      >
        BACK
      </button>
    </div>
  );
}
