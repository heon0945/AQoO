"use client";

import { bgMusicVolumeState, sfxVolumeState } from "@/store/soundAtom";
import { useEffect, useRef, useState } from "react";

import { User } from "@/store/authAtom";
import { useSFX } from "@/hooks/useSFX";

// API에서 받아온 채팅방 멤버 정보 타입 (Member)
export interface Member {
  userName: string;
  nickname: string;
  mainFishImage: string;
  isHost: boolean;
  ready: boolean;
  level: number;
}

interface ParticipantListProps {
  users: Member[]; // API에서 받아온 채팅방 멤버 정보 목록
  currentUser: User; // 로그인한 사용자 정보 (authAtom)
  currentIsHost: boolean;
  onKickUser: (userName: string) => void;
}

export default function ParticipantList({
  users,
  currentUser,
  currentIsHost,
  onKickUser,
}: ParticipantListProps) {
    const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/70 border border-gray-300 rounded-lg shadow-lg p-2 z-10 w-[370px] h-auto">
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          w-full px-2 rounded transition-colors text-center flex justify-between
          hover:bg-gray-100 cursor-pointer
        "
      >
        <span className="sm:text-lg text-base">참가자 리스트 </span>
        <span className="ml-4 mr-auto sm:text-lg text-base">{users.length}</span>
        {isOpen ? "▲" : "▼"}
      </button>

      {/* 
        스르르 열리는 영역:
        - 항상 DOM에 남겨두되, max-height와 opacity를
          조건부 클래스로 바꿔가며 트랜지션한다.
      */}
      <div
        className={`
          mt-2 transition-all duration-300 
          ${isOpen ? "max-h-[140px] opacity-100" : "max-h-0 opacity-0"} 
          overflow-hidden
        `}
      >
        {/* 실제 내용 영역: 스크롤을 위해 overflow-auto */}
        <div className="overflow-auto custom-scrollbar max-h-[130px]">
          <ul className="space-y-2">
            {users.map((member) => {
              let displayName = "";
              if (currentUser?.id === member.userName) {
                displayName = `${currentUser.nickname} (Lv.${currentUser.level})${
                  member.isHost ? " (방장)" : ""
                }`;
              } else {
                displayName = `${member.nickname} (Lv.${member.level})${
                  member.isHost ? " (방장)" : ""
                }`;
              }
              return (
                <li
                  key={member.userName}
                  className="
                    flex justify-between items-center
                    px-4 sm:py-2 py-1 border rounded bg-gray-50
                    hover:bg-gray-100 transition-colors
                  "
                >
                  <div className="text-gray-900 font-medium flex items-center space-x-2">
                    <div className="w-10 h-10 bg-300 rounded-full overflow-hidden">
                      <img
                        src={member.mainFishImage}
                        alt="참가자대표물고기"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                    <div className="sm:text-base text-sm">{displayName}</div>
                  </div>
                  {member.ready && (
                    <span className="text-green-700 font-bold sm:text-base text-sm">
                      Ready
                    </span>
                  )}
                  {currentIsHost && member.userName !== currentUser?.id && (
                    <button
                      onClick={() => onKickUser(member.userName)}
                      className="
                        ml-2 px-2 py-1 text-sm text-gray-600
                        bg-white border border-gray-300 rounded shadow-sm
                        hover:bg-gray-200 transition-colors
                      "
                    >
                      강퇴
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
