"use client";

import axios from "axios";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth"; // 로그인된 사용자 정보 가져오기
import { useRecoilState } from "recoil";
import { participantsState } from "@/store/participantAtom"; // ✅ 참가자 상태 관리

interface Friend {
  id: string;
  nickname: string;
  level: number;
  fishImage?: string;
  friendId: string;
}

export default function FriendList() {
  const { auth } = useAuth();
  console.log("useAuth에서 가져온 사용자 정보", auth);

  // ✅ 직접 테스트할 유저 ID 설정
  const TEST_MODE = true;
  const TEST_USER_ID = "eejj";
  const userId = TEST_MODE ? TEST_USER_ID : auth?.user?.id || "";
  console.log("현재 아이디", userId);

  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useRecoilState(participantsState); // ✅ 참가자 상태 관리

  const API_BASE_URL = "http://i12e203.p.ssafy.io:8089/api/v1";

  // ✅ 친구 목록 API 호출
  useEffect(() => {
    if (!userId) {
      console.warn("⚠ userId가 없음. API 요청을 중단합니다.");
      return;
    }

    axios
      .get(`${API_BASE_URL}/friends/${userId}`)
      .then((response) => {
        console.log("✅ 친구 목록 조회 성공:", response.data);
        setMyFriends(response.data.friends);
      })
      .catch((error) => {
        console.error("❌ 친구 목록 불러오기 실패", error);
        setError("친구 목록을 불러오는데 실패했습니다.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // ✅ 참가자 추가 함수
  const handleAddParticipant = (friend: Friend) => {
    // 이미 추가된 참가자는 중복 추가 방지
    if (participants.some((p) => p.friendId === friend.friendId)) return;

    setParticipants((prev) => [...prev, friend]); // ✅ 참가자 리스트 업데이트
  };

  return (
    <div className="relative w-[400px] h-[600px] bg-white bg-opacity-70 border border-black rounded-lg shadow-lg p-4 flex flex-col">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">친구 {myFriends.length}</h2>
      </div>

      {/* 친구 리스트 */}
      <div className="space-y-3 overflow-y-auto scrollbar-hide flex-grow">
        {loading ? (
          <p className="text-center text-gray-500">로딩 중...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : myFriends.length > 0 ? (
          myFriends.map((friend) => (
            <div key={friend.friendId} className="p-3 bg-white rounded-lg border border-black flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="text-xs">Lv. {friend.level}</p>
                  <p className="font-bold">{friend.nickname}</p>
                  <p className="text-xs">{friend.friendId}</p>
                </div>
              </div>
              <button
                onClick={() => handleAddParticipant(friend)}
                disabled={participants.some((p) => p.friendId === friend.friendId)} // ✅ 이미 추가된 참가자는 비활성화
                className={`px-3 py-1 text-sm rounded-md ${
                  participants.some((p) => p.friendId === friend.friendId)
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {participants.some((p) => p.friendId === friend.friendId) ? "✔" : "추가"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">아직 친구가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
