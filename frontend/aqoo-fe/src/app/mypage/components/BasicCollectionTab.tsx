"use client";

import Image from "next/image";
import CollectionItemCard from "./CollectionItemCard";

export default function BaicCollectionTab() {
  const all_collection = "https://i12e203.p.ssafy.io/api/v1/fish/all-collection";
  const my_collection_api = "https://i12e203.p.ssafy.io/api/v1/fish/collection/:user-id";

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
          // index에 해당하는 이미지가 있으면 쓰고, 없으면 배경 샘플
          const imageSrc = images[index] ? `/images/${images[index]}` : `/images/배경샘플.png`;

          return <CollectionItemCard key={index} imageSrc={imageSrc} name={`거북이 ${index + 1}`} count={11} />;
        })}
    </div>
  );
}
