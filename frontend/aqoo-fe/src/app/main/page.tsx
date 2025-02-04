"use client";

import React, { useEffect, useState } from "react";

import BottomMenu from "@/app/main/BottomMenuBar"; // 하단 메뉴바 컴포넌트
import Link from "next/link";
import { Settings } from "lucide-react";

export default function MainPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [background, setBackground] = useState("/background-1.png");

  // localStorage에서 기존 설정된 배경 불러오기
  useEffect(() => {
    const savedBg = localStorage.getItem("background");
    if (savedBg) {
      setBackground(savedBg);
    }
  }, []);

  // 배경 변경 함수
  const changeBackground = (bg: string) => {
    setBackground(bg);
    localStorage.setItem("background", bg); // 저장해서 새로고침 후에도 유지
  };

  return (
    <div className="relative w-full h-screen">
      {/* 배경 이미지 + 투명 레이어 */}
      <div
        className="absolute inset-0 bg-cover bg-center before:absolute before:inset-0 before:bg-white/30"
        style={{ backgroundImage: `url(${background})` }}
      ></div>

      {/* 상단 네비게이션 */}
      <div className="absolute top-4 left-4 z-10 mt-2 ml-10">
        <Link href="/">
          <span className="text-white text-5xl font-bold">AQoO</span>
        </Link>
      </div>
      <button
        className="absolute top-4 right-4 p-2 mt-2 mr-10 bg-white/30 rounded-full hover:bg-white/50 z-10"
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
      >
        <Settings className="w-6 h-6 text-white" />
      </button>

      {/* 하단 메뉴바 */}
      <BottomMenu />

      {/* 설정 모달 */}
      {isSettingsOpen && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-bold">설정 메뉴</p>
            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => setIsSettingsOpen(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 배경 변경 버튼 */}
      {/* <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-10">
        <p className="text-center font-bold">배경 변경</p>
        <div className="flex space-x-4 mt-2">
          <button
            onClick={() => changeBackground("/background-1.png")}
            className="p-2 bg-blue-500 text-white rounded-lg"
          >
            배경 1
          </button>
          <button
            onClick={() => changeBackground("/background-2.png")}
            className="p-2 bg-green-500 text-white rounded-lg"
          >
            배경 2
          </button>
          <button
            onClick={() => changeBackground("/background-3.png")}
            className="p-2 bg-red-500 text-white rounded-lg"
          >
            배경 3
          </button>
        </div>
      </div> */}
    </div>
  );
}
