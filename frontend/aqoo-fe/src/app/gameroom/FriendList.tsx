"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRecoilState } from "recoil";
import { usersState } from "@/store/participantAtom";

interface Friend {
  id: string; // 친구 관계 아이디
  friendId: string; // 실제 친구의 유저 아이디
  nickname: string;
  level: number;
  mainFishImage?: string | null;
}

interface User extends Friend {
  ready: boolean;
  isHost: boolean;
}

export default function FriendList() {
  const { auth } = useAuth();
  console.log("useAuth에서 가져온 사용자 정보", auth);

  // ✅ TEST_MODE 삭제 및 실제 userId 사용
  const loggedInUser = localStorage.getItem("loggedInUser") || "";
  console.log("현재 아이디", loggedInUser);

  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [users, setUsers] = useRecoilState(usersState);
  const API_BASE_URL = "https://i12e203.p.ssafy.io/api/v1";

  // ✅ 친구 목록 API 호출
  useEffect(() => {
    if (!loggedInUser) {
      console.warn("⚠ userId가 없음. API 요청을 중단합니다.");
      return;
    }

    axios
      .get(`${API_BASE_URL}/friends/${loggedInUser}`)
      .then((response) => {
        console.log("✅ 친구 목록 조회 성공:", response.data);
        setMyFriends(response.data.friends);
      })
      .catch((error) => {
        console.error("❌ 친구 목록 불러오기 실패", error);
      });
  }, [loggedInUser]);

  // ✅ 참가자 추가 함수
  const handleAddParticipant = (friend: Friend) => {
    if (users.some((u) => u.friendId === friend.friendId)) return;
  
    const newUser: User = {
      ...friend,
      ready: false,
      isHost: false,
    };
  
    setUsers((prev) => [...prev, newUser]);
  };

  return (
    <div className="relative w-[400px] h-[600px] bg-white bg-opacity-70 border border-black rounded-lg shadow-lg p-4 flex flex-col">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">친구 {myFriends.length}</h2>
      </div>

      {/* 친구 리스트 */}
      <div className="space-y-3 overflow-y-auto scrollbar-hide flex-grow">
        {myFriends.length > 0 ? (
          myFriends.map((friend) => (
            <div
              key={friend.friendId}
              className="p-3 bg-white rounded-lg border border-black flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full">
                  {friend.mainFishImage ? (
                    <img
                      src={friend.mainFishImage}
                      alt="친구의 대표 물고기"
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <img
                      src="/fish/default.png"
                      alt="기본 물고기 이미지"
                      className="w-full h-full rounded-full"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs">Lv. {friend.level}</p>
                  <p className="font-bold">{friend.nickname}</p>
                  <p className="text-xs">{friend.friendId}</p>
                </div>
              </div>
              <button
                onClick={() => handleAddParticipant(friend)}
                disabled={users.some((u) => u.friendId === friend.friendId)}
                className={`px-3 py-1 text-sm rounded-md ${
                  users.some((u) => u.friendId === friend.friendId)
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {users.some((u) => u.friendId === friend.friendId) ? "✔" : "추가"}
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
