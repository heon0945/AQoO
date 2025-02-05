"use client";

import { useEffect, useState } from "react";

import MenuButton from "./MenuButton";
import { useRouter } from "next/navigation";

export default function BottomMenuBar({ setIsFriendsOpen }: { setIsFriendsOpen: (value: boolean) => void }) {
  const router = useRouter();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[1400px] bg-white/70 rounded-lg px-3 flex flex-wrap items-center justify-between shadow-lg backdrop-blur-md">
      {/* 좌측 메뉴 */}
      <div className="flex space-x-2 md:space-x-4">
        <MenuButton icon="/icon-fishTank.png" label="MyPage" onClick={() => router.push("/mypage")} />
        <MenuButton icon="/alertIcon.png" label="Push" />
        <MenuButton icon="/friendIcon.png" label="Friends" onClick={() => setIsFriendsOpen(true)} />
        <MenuButton icon="/gameIcon.png" label="Game" />
      </div>

      {/* 중앙: 사용자 정보 */}
      <div className="flex flex-col items-center text-center">
        <p className="text-sm md:text-lg font-bold">Lv. 12 닉네임</p>
        <div className="flex items-center space-x-2">
          <p className="text-xs md:text-sm">exp</p>
          <div className="w-32 md:w-40 bg-gray-300 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-4 w-3/5"></div>
          </div>
          <p className="text-xs md:text-sm">70</p>
        </div>
      </div>

      {/* 중앙: 어항 상태 바 */}
      <div className="flex flex-col space-y-1 p-1">
        <StatusBar icon="waterIcon.png" label="어항 수질" value={80} color="bg-blue-900" />
        <StatusBar icon="cleanIcon.png" label="청결도" value={60} color="bg-indigo-400" />
        <StatusBar icon="feedIcon.png" label="포만감" value={40} color="bg-cyan-400" />
      </div>

      {/* 우측 메뉴 */}
      <div className="flex space-x-2 md:space-x-4">
        <MenuButton icon="/waterIcon.png" label="Water" />
        <MenuButton icon="/cleanIcon.png" label="Clean" />
        <MenuButton icon="/feedIcon.png" label="Feed" />
      </div>
    </div>
  );
}

/* 상태 바 */
function StatusBar({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  const segmentCount = 5; // 상태바를 5개의 블록으로 분할
  const activeSegments = Math.round((value / 100) * segmentCount); // 활성화된 블록 수

  return (
    <div className="flex items-center space-x-3">
      {/* 아이콘 */}
      <img src={`/${icon}`} alt={label} className="w-6 h-6 md:w-8 md:h-8" />

      {/* 라벨 */}
      <span className="w-[72px] md:w-[86px] text-xs md:text-base text-black text-center">{label}</span>

      {/* 상태 바 */}
      <div className="w-40 md:w-48 h-4 md:h-5 flex border-2 border-black rounded-full overflow-hidden">
        {Array.from({ length: segmentCount }).map((_, index) => (
          <div
            key={index}
            className={`flex-1 border-l border-black ${index < activeSegments ? color : "bg-white"} ${
              index === 0 ? "rounded-l-full" : ""
            } ${index === segmentCount - 1 ? "rounded-r-full" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
