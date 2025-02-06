"use client";

import Image from "next/image";

interface BackgroundItemCardProps {
  name: string;
  imageSrc: string;
}

// 배경용 카드
export default function BackgroundItemCard({ name, imageSrc }: BackgroundItemCardProps) {
  return (
    <div
      className="
        flex flex-col mr-1 ml-4
        w-[280px] h-[180px] flex-shrink-0
        items-center justify-center
        bg-white
        rounded-xl
        relative
      "
    >
      <Image src={imageSrc} alt={name} fill className="rounded-xl" />
    </div>
  );
}
