"use client";

import { AquariumData, UserInfo } from "@/types";
import { useEffect, useState } from "react";

import MenuButton from "./MenuButton";
import { useRouter } from "next/navigation";

export default function BottomMenuBar({
  setActiveComponent,
  userInfo,
  aquariumData,
}: {
  setActiveComponent: (value: string | null) => void;
  userInfo: UserInfo;
  aquariumData?: AquariumData;
}) {
  const router = useRouter();

  // ✅ 현재 레벨에서 필요한 경험치량 계산
  const requiredExpForCurrentLevel = userInfo.level * 20; // 현재 레벨에서 필요한 exp
  const currentLevelBaseExp = (userInfo.level - 1) * userInfo.level * 10; // 이전 레벨까지의 총 exp
  const expProgress = ((userInfo.exp - currentLevelBaseExp) / requiredExpForCurrentLevel) * 100; // 현재 경험치 바 퍼센트

  // 🔹 경험치 퍼센트가 0~100 범위를 벗어나지 않도록 보정
  const progressBarWidth = Math.max(0, Math.min(expProgress, 100));

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[1400px] bg-white/70 rounded-lg px-3 flex flex-wrap items-center justify-between shadow-lg backdrop-blur-md">
      {/* 좌측 메뉴 */}
      <div className="flex space-x-2 md:space-x-4">
        {/* ✅ MyPage는 페이지 이동 */}
        <MenuButton icon="/icon-fishTank.png" label="MyPage" onClick={() => router.push("/mypage")} />

        {/* ✅ 친구 목록 */}
        <MenuButton icon="/friendIcon.png" label="Friends" onClick={() => setActiveComponent("friends")} />

        {/* ✅ Push 알림 */}
        <MenuButton icon="/alertIcon.png" label="Push" onClick={() => setActiveComponent("push")} />

        {/* ✅ Game 히스토리 */}
        <MenuButton icon="/gameIcon.png" label="Game" onClick={() => router.push("/gameroom")} />
      </div>
      {/* 중앙: 사용자 정보 */}
      <div className="flex flex-col items-center text-center">
        <p className="text-sm md:text-lg font-bold">
          Lv. {userInfo.level} {userInfo.nickname}
        </p>
        <div className="flex items-center space-x-2">
          <p className="text-xs md:text-sm">exp</p>
          <div className="w-32 md:w-40 bg-gray-300 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-4" style={{ width: `${progressBarWidth}%` }}></div>
          </div>
          <p className="text-xs md:text-sm">{userInfo.exp}</p>
        </div>
      </div>
      {/* 중앙: 어항 상태 바 */}
      <div className="flex flex-col space-y-1 p-1">
        <StatusBar icon="waterIcon.png" label="어항 수질" value={aquariumData?.waterStatus ?? 0} color="bg-blue-900" />
        <StatusBar
          icon="cleanIcon.png"
          label="청결도"
          value={aquariumData?.pollutionStatus ?? 0}
          color="bg-indigo-400"
        />
        <StatusBar icon="feedIcon.png" label="포만감" value={aquariumData?.feedStatus ?? 0} color="bg-cyan-400" />{" "}
        {/* 🔹 더미 데이터 */}
      </div>

      {/* 우측 메뉴 */}
      <div className="flex space-x-2 md:space-x-4">
        <MenuButton icon="/waterIcon.png" label="Water" />
        <MenuButton icon="/cleanIcon.png" label="Clean" onClick={() => setActiveComponent("clean")} />
        <MenuButton icon="/feedIcon.png" label="Feed" />
      </div>
    </div>
  );
}

/* 상태 바 */
/* 상태 바 */
function StatusBar({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  const segmentCount = 5; // ✅ 상태 바는 총 5칸
  const activeSegments = Math.max(0, Math.min(value, segmentCount)); // ✅ 0~5 범위로 유지

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
