'use client';

import { useRecoilState } from "recoil";
import { participantsState } from "@/store/participantAtom";

export default function ChatParticipantList() {
  const [participants] = useRecoilState(participantsState);

  return (
    <div className="w-96 h-40 bg-white bg-opacity-80 border border-gray-400 rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-bold mb-3">참가자 리스트 {participants.length}</h2>

      {/* 닉네임 & 상태 부분만 스크롤 가능 */}
      <div className="overflow-y-auto max-h-[100px] space-y-2 pr-2">
        {participants.map((participant) => (
          <div 
            key={participant.id} 
            className="flex justify-between items-center px-3 py-2 border rounded-md bg-gray-100"
          >
            {/* 이 부분만 스크롤 가능 */}
            <div className="overflow-y-auto max-h-[80px] pr-2">
              <p className="text-sm font-bold">Lv.{participant.level} {participant.nickname}</p>
            </div>

            {/* 참가자 준비 상태 표시 */}
            <p className={`text-xs font-semibold ${participant.status === "READY" ? "text-green-500" : "text-gray-500"}`}>
              {participant.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
