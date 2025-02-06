"use client";

import { useEffect, useState } from "react";

interface FishData {
  id: number;
  name: string;
  count: number;
  imageSrc: string;
}

/**
 * 커스텀 훅: 물고기 목록을 불러오고, 로딩/에러 상태 등을 관리할 수 있음.
 * 필요하다면 실제 API 호출(fetch/axios) 로직도 여기에 작성.
 */
export function useFishCollection() {
  const [fishList, setFishList] = useState<FishData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadFish() {
      try {
        // 여기서는 예시로 "가짜" 데이터를 로컬에서 할당
        // 실제로는 fetch/axios 등을 통해 서버에서 가져올 수도 있음.
        const dummyData: FishData[] = [
          { id: 1, name: "거북이 1", count: 2, imageSrc: "/images/대표이미지샘플.png" },
          { id: 2, name: "거북이 2", count: 1, imageSrc: "/images/대표이미지샘플 (2).png" },
          { id: 3, name: "거북이 3", count: 5, imageSrc: "/images/대표이미지샘플 (3).png" },
        ];
        // 0.5초 후 데이터 세팅하는 예시
        setTimeout(() => {
          setFishList(dummyData);
          setIsLoading(false);
        }, 500);
      } catch (e) {
        setError(e as Error);
        setIsLoading(false);
      }
    }

    loadFish();
  }, []);

  return { fishList, isLoading, error };
}
