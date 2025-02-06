"use client";

import Image from "next/image";

interface CollectionItemCardProps {
  name: string;
  count: number;
  imageSrc: string;
}

// 물고기용 카드: border 및 shadow 있음
export default function CollectionItemCard({ name, count, imageSrc }: CollectionItemCardProps) {
  return (
    <div
      className="
        flex flex-col m-2
        w-[170px] h-[200px] flex-shrink-0
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
          border border-black bg-white
        "
      >
        <Image src={imageSrc} alt={name} width={130} height={130} style={{ objectFit: "cover" }} />
      </div>
      <div
        className="
          flex items-end gap-2 text-[20px]
          font-[NeoDunggeunmo_Pro] text-black mt-1
        "
      >
        <p>{name}</p>
        <p className="text-[15px] text-gray-500">x {count}</p>
      </div>
    </div>
  );
}
