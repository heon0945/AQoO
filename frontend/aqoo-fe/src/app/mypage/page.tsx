"use client";

import LeftButtons from "./LeftButtons";
import Profile from "./Profile";
import MyCollection from "./MyCollection";

export default function myPage() {
  return (
    <div
      className="
        flex 
        min-h-screen 
        bg-[url('/images/배경샘플.png')] 
        bg-cover bg-center bg-no-repeat
      "
    >
      {/* 왼쪽 상단 버튼 */}
      <LeftButtons />
      {/* 메인 컨테이너 (내 정보 도감) */}
      <div className="flex flex-col items-center flex-1">
        <Profile />
        <MyCollection />
      </div>
    </div>
  );
}
