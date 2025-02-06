"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import BaicCollectionTab from "./BasicCollectionTab";
import CustomCollectionTab from "./CustomCollectionTab";

export default function MyCollection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedTab = searchParams.get("tab") || "one";

  const handleTabChange = (tabName: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", tabName);
    router.push(`/mypage?${newParams.toString()}`);
  };

  return (
    <div className="relative flex flex-col">
      {/* 탭 영역 */}
      <div>
        <button
          onClick={() => handleTabChange("one")}
          className={`
            relative left-[30px] 
            cursor-pointer inline-flex items-center justify-center
            w-[150px] h-10 px-[20px] py-[10px] m-1
            rounded-t-xl border-t border-r border-l border-[#1c5e8d]
            bg-[#f0f0f0]
            [box-shadow:-1px_0px_0px_2px_rgba(0,0,0,0.25)_inset]
            text-[#070707] text-2xl font-[NeoDunggeunmo_Pro] font-normal leading-normal
            ${selectedTab === "one" ? "bg-[#31a9ff] text-black border-t-[3px] border-black" : ""}
          `}
        >
          도감관리
        </button>
        <button
          onClick={() => handleTabChange("two")}
          className={`
            relative left-[30px] 
            cursor-pointer inline-flex items-center justify-center
            w-[150px] h-10 px-[20px] py-[10px] m-1
            rounded-t-xl border-t border-r border-l border-[#1c5e8d]
            bg-[#f0f0f0]
            [box-shadow:-1px_0px_0px_2px_rgba(0,0,0,0.25)_inset]
            text-[#070707] text-2xl font-[NeoDunggeunmo_Pro] font-normal leading-normal
            ${selectedTab === "two" ? "bg-[#31a9ff] text-black border-t-[3px] border-black" : ""}
          `}
        >
          커스텀
        </button>
      </div>

      {/* 어항관리 버튼 (오른쪽 상단) */}
      <Link href="mypage/fishtank" className="absolute right-0 top-0">
        <button
          className="
            min-w-[80px] h-10 px-2
            rounded-xl border border-[#040303] bg-white 
            [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
            flex items-center justify-center
            text-[#070707] text-center font-[400] text-2xl
            font-[NeoDunggeunmo_Pro]
          "
        >
          어항관리
        </button>
      </Link>

      {/* 탭 컨텐츠 영역 */}
      <div
        className="
          w-[1300px] h-screen m-0 p-5
          rounded-xl border-2 border-[#1c5e8d] bg-[#31a9ff]
          [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.25)_inset]
          flex flex-col items-center
        "
      >
        <div className="flex-1 overflow-y-auto bg-white w-full h-full rounded-[30px]">
          <div className="bg-white overflow-hidden">
            {selectedTab === "one" && <BaicCollectionTab />}
            {selectedTab === "two" && <CustomCollectionTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
