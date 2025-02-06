"use client";

import { useState } from "react";
import FishTankTabContent from "./FishTankTabContent";

export default function FishTankTabs() {
  // 초기 탭 4개 (문자열 배열)
  const [tabs, setTabs] = useState(["어항 1", "어항 2", "어항 3", "어항 4"]);
  // 현재 선택된 탭 인덱스
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 어항 생성하기 버튼 클릭 시
  const handleAddTank = () => {
    const newTabName = `어항 ${tabs.length + 1}`;
    setTabs([...tabs, newTabName]);
    // 새로 생성된 탭으로 이동
    setSelectedIndex(tabs.length);
  };

  return (
    <div>
      {/* 탭 버튼 영역 */}
      <div className="flex items-center margin-bottom-0">
        {tabs.map((tabName, idx) => (
          <button
            key={tabName}
            onClick={() => setSelectedIndex(idx)}
            className={`
              cursor-pointer inline-flex items-center justify-center
              w-[150px] h-15 px-[20px] py-[10px] mr-1
              rounded-t-xl border-t border-r border-l border-[#1c5e8d]
              bg-[#f0f0f0]
              [box-shadow:-1px_0px_0px_2px_rgba(0,0,0,0.25)_inset]
              text-[#070707] text-2xl font-[NeoDunggeunmo_Pro] font-normal leading-normal
              ${selectedIndex === idx ? "bg-[#31A9FF] text-3xl text-black border-t-[3px] border-black" : ""}
            `}
          >
            {tabName}
          </button>
        ))}

        {/* 어항 생성하기 버튼 */}
        <button
          onClick={handleAddTank}
          className="
            ml-auto mr-2
            min-w-[80px] h-[60px] px-2
            rounded-xl border border-[#040303] bg-white 
            [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
            text-[#070707] text-center font-[400] text-2xl
            font-[NeoDunggeunmo_Pro]
          "
        >
          어항 생성하기
        </button>
      </div>

      {/* 실제 탭 컨텐츠 영역 */}
      <div
        className="
          w-[1300px] h-screen m-0 p-0
          rounded-xl rounded-tl-none border-2 border-[#1c5e8d] bg-[#31a9ff]
          [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.25)_inset]
          flex flex-col
        "
      >
        <FishTankTabContent tabName={tabs[selectedIndex]} />
      </div>
    </div>
  );
}
