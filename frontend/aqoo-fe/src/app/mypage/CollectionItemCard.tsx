"use client";

import Image from "next/image";

// 공통으로 사용할 아이템 카드 컴포넌트
// name: 아이템 이름 (예: '거북이 1')
// count: 아이템 수량
// imageSrc: 이미지 경로
interface CollectionItemCardProps {
  name: string;
  count: number;
  imageSrc: string;
}

export default function CollectionItemCard({ name, count, imageSrc }: CollectionItemCardProps) {
  return (
    <div
      className="
        flex flex-col m-2
        w-[170px] h-[170px] flex-shrink-0
        items-center justify-center
        rounded-xl border border-black bg-white
        [box-shadow:-2px_-2px_0px_1px_rgba(0,0,0,0.5)_inset]
        text-[1.5em] font-bold
      "
    >
      <div
        className="
          w-[150px] h-[150px]
          flex items-center justify-center
          flex-col
          rounded-xl border border-black bg-white
        "
      >
        <Image src={imageSrc} alt={name} width={130} height={130} style={{ objectFit: "cover" }} />
        <div
          className="
          flex items-end gap-2 text-[15px]
          font-[NeoDunggeunmo_Pro] text-black mt-1
        "
        >
          <p>{name}</p>
          <p className="text-[10px] text-gray-500">x {count}</p>
        </div>
      </div>
    </div>
  );
}
