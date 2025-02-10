"use client";

import CollectionItemCard from "./CollectionItemCard";

interface CustomCollectionTapProps {
  customFishList:{
  fishTypeId: number;
  fishTypeName: string;
  fishImage: string;
}[];
}
// 탭 "커스텀" 화면
export default function CustomCollectionTab({customFishList}:CustomCollectionTapProps) {
  return (
    <div className="flex flex-wrap">
      {customFishList.map((fish) => (
      <CollectionItemCard 
      key={fish.fishTypeId}
      imageSrc={fish.fishImage}
      name={fish.fishTypeName}/>
      ))}
    </div>
  );
}


// {Array(50)
//   .fill(null)
//   .map((_, index) => {
//     const fish = userFishList[index]; // 현재 index에 해당하는 물고기 가져오기
//     const imageSrc = fish
//       ? `${fish.fishImage}`
//       : "/images/배경샘플.png"; // 물고기가 없으면 기본 배경 이미지 사용
//     console.log(`이미지: ${imageSrc}`)
//     const name = fish ? fish.fishTypeName : `미등록`; // 물고기가 없으면 기본 이름
//     const count = fish ? fish.cnt : 0; // 기본 수량 (물고기가 없으면 0)
//     return <CollectionItemCard key={index} imageSrc={imageSrc} name={name} count={count} />;
//   })}