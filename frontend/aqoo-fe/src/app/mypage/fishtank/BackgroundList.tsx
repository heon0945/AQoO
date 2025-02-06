"use client";

import BackgroundItemCard from "./BackgroundItemCard";

export default function BackgroundList() {
  // 배경화면 목록 예시
  const backgroundList = [
    { id: 1, name: "해변 배경", imageSrc: "/images/배경샘플.png" },
    { id: 2, name: "밤하늘 배경", imageSrc: "/images/대표이미지샘플 (6).png" },
    { id: 3, name: "정글 배경", imageSrc: "/images/대표이미지샘플 (7).png" },
  ];

  return (
    // bg-blue + border 없음
    <div className="bg-white w-full h-full rounded-[30px] p-4 overflow-auto">
      <div className="flex flex-wrap">
        {backgroundList.map((bg) => (
          <BackgroundItemCard key={bg.id} name={bg.name} imageSrc={bg.imageSrc} />
        ))}
      </div>
    </div>
  );
}
