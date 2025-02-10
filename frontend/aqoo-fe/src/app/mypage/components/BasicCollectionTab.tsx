"use client";

import Image from "next/image";
import CollectionItemCard from "./CollectionItemCard";

interface BasicCollectionTabProps {
  allFishList: { id: number; fishName: string; imageUrl: string; rarity: string }[];
}

export default function BasicCollectionTab({allFishList = []}:BasicCollectionTabProps) {
  const IMAGE_SERVER = process.env.NEXT_PUBLIC_IMAGE_API_SERVER;

  // 도감 이미지 Dummy
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
    <div id="one-panel" className="flex flex-wrap">
      {Array(50)
        .fill(null)
        .map((_, index) => {
          const fish = allFishList[index]; // 현재 index에 해당하는 물고기 가져오기
          const imageSrc = fish
            ? `${IMAGE_SERVER}/${fish.fishName}.png`
            : "/images/배경샘플.png"; // 물고기가 없으면 기본 배경 이미지 사용
          console.log(`이미지: ${imageSrc}`)
          const name = fish ? fish.fishName : `미등록`; // 물고기가 없으면 기본 이름
          const count = fish ? 1 : 0; // 기본 수량 (물고기가 없으면 0)
          return <CollectionItemCard key={index} imageSrc={imageSrc} name={name} count={11} />;
        })}
    </div>
  );
}
