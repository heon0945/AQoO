'use client';

import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FriendList from "@/app/gameroom/FriendList";
import ParticipantList from "@/app/gameroom/ParticipantList";
import { useState } from "react";

export default function Page() {
  // Query Client 생성
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        {/* 배경 컨테이너 */}
        <div 
          className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
          style={{ backgroundImage: "url('/images/background.png')" }} // 배경 이미지 적용
        >
          {/* 투명도 있는 배경 오버레이 */}
          <div className="absolute inset-0 bg-white opacity-20"></div>
  
          {/* 내용물 */}
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-6 text-black">🎮 방 만들기 🕹️</h1>
            <div className="flex gap-6">
              <FriendList />
              <ParticipantList />
            </div>
          </div>
        </div>
      </RecoilRoot>
    </QueryClientProvider>
  );
  
}
