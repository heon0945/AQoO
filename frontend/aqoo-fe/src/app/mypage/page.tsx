"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function MyPage() {
  const [selectedTab, setSelectedTab] = useState("one");

  // 도감 이미지 임시.
  const images = [
    "대표이미지샘플 (2).png",
    "대표이미지샘플 (3).png",
    "대표이미지샘플 (4).png",
    "대표이미지샘플 (5).png",
    "대표이미지샘플 (6).png",
    "대표이미지샘플 (7).png",
    "대표이미지샘플 (8).png",
    "대표이미지샘플 (9).png",
    "대표이미지샘플 (10).png",
  ];

  return (
    // 전체 화면에 배경 적용
    <div
      className="
      flex 
      min-h-screen 
      bg-[url('/images/배경샘플.png')] 
      bg-cover bg-center bg-no-repeat
    "
    >
      {/* 왼쪽 상단 (Home / Logout) 버튼 영역 */}
      <div className="flex flex-col justify-between m-2">
        <button
          className="
            min-w-[80px] h-10 px-2
            rounded-xl border border-[#040303] bg-white 
            [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
            flex items-center justify-center
            text-[#070707] text-center font-[400] text-2xl leading-none
            font-[NeoDunggeunmo_Pro]
          "
        >
          Home
        </button>
        <button
          className="
            min-w-[80px] h-10 px-2 mt-2
            rounded-xl border border-[#040303] bg-white 
            [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
            flex items-center justify-center
            text-[#070707] text-center font-[400] text-2xl leading-none
            font-[NeoDunggeunmo_Pro]
          "
        >
          Logout
        </button>
      </div>

      {/* 메인 컨테이너 (내 정보 + 도감) */}
      <div className="flex flex-col items-center flex-1">
        {/* 내 정보 영역 */}
        <div
          className="
            m-2
            w-[1300px] h-[200px]
            rounded-[30px] bg-[#fffdfd]
            border-2 border-[#1c5e8d]
            [box-shadow:-2px_-2px_0px_2px_rgba(0,0,0,0.25)_inset]
            flex justify-between items-center
          "
        >
          {/* 좌측: 초상화 + 레벨/닉네임/정보 */}
          <div className="flex gap-2 justify-center ml-2">
            {/* 초상화 컨테이너 */}
            <div
              className="
                w-[170px] h-[170px] flex-shrink-0
                flex items-center justify-center
                rounded-xl border border-black bg-white
                [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
              "
            >
              {/* 실제 초상화 */}
              <div
                className="
                  w-[150px] h-[150px] flex-shrink-0
                  flex items-center justify-center
                  border border-black bg-white
                  [box-shadow:1px_1px_0px_1px_rgba(0,0,0,0.25)_inset]
                "
              >
                <Image
                  src="/images/대표이미지샘플.png"
                  alt="대표 이미지"
                  width={130}
                  height={130}
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>

            {/* 레벨/닉네임/총 물고기 등 텍스트 */}
            <div className="flex flex-col justify-center">
              <p
                className="
                  min-w-[200px] h-10 flex-shrink-0 mt-2 mb-2 px-2
                  flex items-center
                  text-[#070707] text-center text-2xl font-[400] leading-normal
                  font-[NeoDunggeunmo_Pro]
                  rounded-xl border-[3px] border-black bg-white
                  [box-shadow:1px_1px_0px_1px_rgba(0,0,0,0.5)_inset]
                "
              >
                레벨: 1234
              </p>
              <p
                className="
                  min-w-[200px] h-10 flex-shrink-0 mb-2 px-2
                  flex items-center
                  text-[#070707] text-center text-2xl font-[400] leading-normal
                  font-[NeoDunggeunmo_Pro]
                  rounded-xl border-[3px] border-black bg-white
                  [box-shadow:1px_1px_0px_1px_rgba(0,0,0,0.5)_inset]
                "
              >
                닉네임: 회사랑김싸피
              </p>
              <p
                className="
                  min-w-[200px] h-10 flex-shrink-0 mb-2 px-2
                  flex items-center
                  text-[#070707] text-center text-2xl font-[400] leading-normal
                  font-[NeoDunggeunmo_Pro]
                  rounded-xl border-[3px] border-black bg-white
                  [box-shadow:1px_1px_0px_1px_rgba(0,0,0,0.5)_inset]
                "
              >
                총 물고기 갯수: 100 마리
              </p>
            </div>
          </div>

          {/* 우측: 회원정보수정 버튼 */}
          <div className="self-start m-2 mr-5">
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
              회원정보수정
            </button>
          </div>
        </div>

        {/* 탭 + 어항관리 버튼 + 도감 리스트 */}
        <div className="relative flex flex-col">
          {/* 탭 영역 */}
          <div>
            <button
              onClick={() => setSelectedTab("one")}
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
              onClick={() => setSelectedTab("two")}
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

          {/* 도감 리스트 컨테이너 */}
          <div
            className="
              w-[1300px] h-screen m-0 p-5
              rounded-xl border-2 border-[#1c5e8d] bg-[#31a9ff]
              [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.25)_inset]
              flex flex-col items-center
            "
          >
            {/* 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto bg-white w-full h-full rounded-[30px]">
              <div className="bg-white overflow-hidden">
                {/* 탭이 "one"일 때 */}
                {selectedTab === "one" && (
                  <div id="one-panel" className="flex flex-wrap">
                    {Array(50)
                      .fill(null)
                      .map((_, index) => {
                        // index에 해당하는 이미지가 있으면 쓰고, 없으면 배경 샘플
                        const imageSrc = images[index] ? `/images/${images[index]}` : `/images/배경샘플.png`;
                        return (
                          <div
                            key={index}
                            className="
                              flex flex-col m-2
                              text-[1.5em] font-bold
                              items-center
                            "
                          >
                            <div
                              className="
                                w-[150px] h-[150px]
                                flex items-center justify-center
                                border border-black bg-white
                                [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
                              "
                            >
                              <Image
                                src={imageSrc}
                                alt={`대표 이미지 ${index}`}
                                width={130}
                                height={130}
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                            <div
                              className="
                                flex items-end gap-2 text-[20px]
                                font-[NeoDunggeunmo_Pro] text-black mt-1
                              "
                            >
                              <p>거북이 {index + 1}</p>
                              <p className="text-[15px] text-gray-500">x 11</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* 탭이 "two"일 때 */}
                {selectedTab === "two" && (
                  <div className="flex flex-wrap">
                    <div
                      className="
                        flex flex-col m-2
                        text-[1.5em] font-bold
                        items-center
                      "
                    >
                      <div
                        className="
                          w-[150px] h-[150px]
                          flex items-center justify-center
                          border border-black bg-white
                          [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
                        "
                      >
                        <Image
                          src="/images/대표이미지샘플.png"
                          alt="대표 이미지"
                          width={130}
                          height={130}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div
                        className="
                          flex items-end gap-2 text-[20px]
                          font-[NeoDunggeunmo_Pro] text-black mt-1
                        "
                      >
                        <p>거북이</p>
                        <p className="text-[15px] text-gray-500">x 111</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
