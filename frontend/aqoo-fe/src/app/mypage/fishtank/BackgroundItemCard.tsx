"use client";

import Image from "next/image";

interface BackgroundItemCardProps {
  name: string;
  imageSrc: string;
}

// 배경용 카드: border 제거 (기존 스타일에서 border만 뺀 형태)
export default function BackgroundItemCard({ name, imageSrc }: BackgroundItemCardProps) {
  return (
    <div
      className="
        flex flex-col m-2
        w-[280px] h-[200px] flex-shrink-0
        items-center justify-center
        bg-white
        rounded-xl
      "
    >
      <Image src={imageSrc} alt={name} width={280} height={200} style={{ objectFit: "cover" }} />
    </div>
  );
}
