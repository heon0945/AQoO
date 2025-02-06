"use client";

import CollectionItemCard from "../app/mypage/fishtank/CollectionItemCard"; // 예시 경로
import { useFishCollection } from "./useFishCollection"; // 예시 경로

export default function MyFishCollection() {
  // 훅에서 물고기 리스트 및 로딩/에러 상태를 가져옴
  const { fishList, isLoading, error } = useFishCollection();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>에러가 발생했습니다: {error.message}</div>;
  }

  return (
    // 기존과 마찬가지로 bg-blue w-full h-full 등 원하는 Tailwind 적용
    <div className="bg-blue w-full h-full rounded-[30px] p-4 overflow-auto">
      <div className="flex flex-wrap">
        {fishList.map((fish) => (
          <CollectionItemCard key={fish.id} name={fish.name} count={fish.count} imageSrc={fish.imageSrc} />
        ))}
      </div>
    </div>
  );
}
