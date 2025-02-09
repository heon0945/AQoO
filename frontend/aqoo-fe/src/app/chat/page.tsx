"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecoilRoot, useRecoilState } from "recoil";
import { participantsState, Friend } from "@/store/participantAtom";
import HostManager from "@/app/chat/HostManager"; // ✅ 방장 정보 컴포넌트 추가

import ChatBox from "@/app/chat/ChatBox";
import ParticipantList from "@/app/chat/ParticipnatList";

export default function ChatRoom() {
  return (
    <RecoilRoot>
      <ChatScreen />
    </RecoilRoot>
  );
}

// ✅ 채팅 화면 컴포넌트
function ChatScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [participants, setParticipants] = useRecoilState(participantsState);
  const [hostUser, setHostUser] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 테스트 모드 설정
  const TEST_MODE = true;
  const TEST_USER_ID = "test_user";

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const parsedData: Friend[] = JSON.parse(decodeURIComponent(data));

        if (hostUser) {
          const updatedParticipants = parsedData.some(p => p.id === hostUser.id)
            ? parsedData
            : [hostUser, ...parsedData];

          setParticipants(updatedParticipants);
        } else {
          setParticipants(parsedData);
        }
      } catch (error) {
        console.error("❌ 참가자 데이터 파싱 오류:", error);
        setError("참가자 데이터를 불러올 수 없습니다.");
      }
    }
  }, [searchParams, setParticipants, hostUser]);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/images/background.png')" }}
    >
      {/* ✅ 방장 정보 로드 (UI는 없고 데이터만 설정) */}
      <HostManager TEST_MODE={TEST_MODE} TEST_USER_ID={TEST_USER_ID} setHostUser={setHostUser} />

      {/* 참가자 리스트 */}
      <div className="absolute top-4 right-4">
        <ParticipantList />
      </div>

      {/* 채팅방 */}
      <div className="bg-white bg-opacity-80 border border-gray-300 rounded-lg p-4 w-[400px] shadow-md">
        {loading ? (
          <p className="text-center text-gray-500">로딩 중...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <ChatBox />
        )}
      </div>

      {/* 나가기 버튼 */}
      <button
        onClick={() => router.push("/gameroom")}
        className="fixed bottom-10 left-7 px-10 py-2 rounded-lg border border-black bg-white text-2xl shadow-md hover:bg-gray-100"
      >
        나가기
      </button>
    </div>
  );
}
