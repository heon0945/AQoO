"use client";

import { useEffect, useState } from "react";
import { fetchMyFish } from "@/lib/fish_api";

interface Fish {
  fishTypeId: number;
  fishTypeName: string;
  fishImage: string;
}

const MyFishlist = ({ server, userId, token }: { server: string; userId: string; token: string }) => {
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFishList = async () => {
      setLoading(true);
      const data = await fetchMyFish(server, userId, token);
      if (data) {
        setFishList(data);
      } else {
        setError("물고기 정보를 불러오는데 실패했습니다.");
      }
      setLoading(false);
    };

    getFishList();
  }, [server, userId, token]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {fishList.map((fish) => (
        <div key={fish.fishTypeId}>
          <img src={fish.fishImage ? fish.fishImage : ""} alt={fish.fishTypeName} />
          <p>{fish.fishTypeName}</p>
        </div>
      ))}
    </div>
  );
};

export default MyFishlist;
