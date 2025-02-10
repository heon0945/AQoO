"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Friend } from "@/store/participantAtom";
import { useAuth } from "@/hooks/useAuth"; // 로그인 정보 가져오기

const API_BASE_URL = "http://i12e203.p.ssafy.io:8089/api/v1";

interface HostManagerProps {
  TEST_MODE: boolean;
  TEST_USER_ID: string;
  setHostUser: (user: Friend | null) => void;
}

// ✅ 방장 정보를 가져오는 컴포넌트
export default function HostManager({ TEST_MODE, TEST_USER_ID, setHostUser }: HostManagerProps) {
  const { auth } = useAuth();
  console.log("🔍 useAuth에서 가져온 사용자 정보:", auth);

  useEffect(() => {
    if (TEST_MODE) {
      // ✅ 테스트 모드: 가짜 유저 데이터 사용
      const testUser: Friend = {
        id: TEST_USER_ID,
        friendId: TEST_USER_ID, // ✅ friendId 추가
        nickname: "eejj",
        level: 1,
      };
      setHostUser(testUser);
    } else {
      axios
        .get(`${API_BASE_URL}/users/me`, { withCredentials: true })
        .then((response) => {
          if (response.data) {
            const host = {
              id: response.data.id,
              friendId: response.data.id, // ✅ friendId 추가
              nickname: response.data.nickname,
              level: response.data.level || 1,
            };
            setHostUser(host);
          }
        })
        .catch((error) => {
          console.error("❌ 로그인한 유저 정보 가져오기 오류:", error);
          setHostUser(null);
        });
    }
  }, [TEST_MODE, TEST_USER_ID, setHostUser]);

  return null; // ✅ UI 없이 로직만 실행
}
