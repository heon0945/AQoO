'use client';

import { useState } from "react";

import { RecoilRoot, useRecoilValue } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FriendList from "@/app/gameroom/FriendList";
import ParticipantList from "@/app/gameroom/ParticipantList";

import { participantsState } from "@/store/participantAtom" // 참가자 상태 가져오기

export default function Page() {
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

// 방 생성 컴포넌트(Recoil 상태 사용)
function RoomCreationScreen() {
  const participants = useRecoilValue(participantsState); // 참가자 목록 가져오기

  const handleCreateRoom = () => {
    if (participants.length == 0) {
      alert("참가자가 없습니다! 최소 1명 이상 추가해주세요.");
      return;
    }

    // 여기서 방 생성 로직 추가?(api 요청 등)
    console.log("방 생성 진행...");
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.png"}}
    >
      {/* 투명도 있는 배경 오버레이 */}
      <div className="absolute inset-0 bg-white opacity-20"></div>

      {/* 내용물 */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="ext-4xl font-bold mb-6 text-black text-5xl">🎮 방 만들기 🕹️</h1>
        <div className="flex gap-6">
          <FriendList />
          <ParticipantList />
        </div>
      </div>

      {/* 만들기 버튼 */}
      <button
        className="fixed bottom-10 right-7 px-10 py-1 rounded border border-black bg-white text-2xl"
        onClick={handleCreateRoom} // 버튼 클릭 시 실행
      >
        만들기
      </button>

      {/* 뒤로가기 버튼 */}
      <button className="fixed bottom-10 left-7 px-10 py-1 rounded border border-black bg-white text-2xl">
        BACK
      </button>
    </div>
  );
}