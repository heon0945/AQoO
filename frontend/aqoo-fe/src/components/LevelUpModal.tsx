"use client";

import { useRouter } from "next/navigation";

export default function LevelUpModal() {
  const router = useRouter();

  return (
    <div className="w-96 h-[450px] bg-white bg-opacity-70 border border-black rounded-lg p-4">
      <p className="font-bold mb-2">참여자 목록</p>
      <div className="overflow-y-auto h-72 flex flex-col gap-2"></div>
    </div>
  );
}
