import { useQuery } from "@tanstack/react-query";
import {  } from "@/store/participantAtom";

// 친구목록 API 요청
const fetchFriends = async (): Promise<Friend[]> => {
    const response = await fetch("http://i12e203.p.ssafy.io:8089/api/v1/friends/me"); // 내부 api 요청
    if (!response.ok) throw new Error("Failed to fetch friends");
    return response.json();
};

// 친구목록 가져오는 React Query Hook
export function useFriends() {
    return useQuery({
        queryKey: ["friends"],
        queryFn: fetchFriends,
        staleTime: 1000 * 60 * 5, // 5분동안 캐싱 유지지
    });
}