"use client";

import CollectionItemCard from "./CollectionItemCard";

// 탭 "커스텀" 화면
export default function CustomCollectionTab() {
  // 여기서는 예시로 단 1개의 아이템만 표시
  // 실제로 여러 개를 표시하려면 Array.map() 형태로 구현해도 됩니다.
  return (
    <div className="flex flex-wrap">
      <CollectionItemCard imageSrc="/images/대표이미지샘플.png" name="거북이" count={111} />
    </div>
  );
}
