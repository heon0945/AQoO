'use client';

import { useState } from 'react';

interface Participant {
  id: string; // ✅ 유저 ID (user_id를 참조)
  nickname: string; // ✅ 닉네임
  level: number; // ✅ 레벨
  fishImage?: string; // ✅ 대표 물고기 이미지
}

interface ParticipantListProps {
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  addedFriends: string[];
  setAddedFriends: (addedFriends: string[]) => void;
}

export default function ParticipantList({ participants, setParticipants, addedFriends, setAddedFriends }: ParticipantListProps) {

  const handleRemoveParticipant = (userId: string) => {
    // ✅ 참가자 목록에서 제거
    setParticipants(participants.filter((p) => p.id !== userId));

    // ✅ 친구 목록에서도 다시 "추가" 버튼 활성화
    setAddedFriends(addedFriends.filter((id) => id !== userId));
  };

  return (
    <div className="w-72 h-[500px] bg-white bg-opacity-70 border border-black rounded-lg p-4">
      <p className="font-bold mb-2">참여자 목록</p>
      <div className="overflow-y-auto h-[400px] flex flex-col gap-2">
        {participants.length > 0 ? (
          participants.map((participant) => (
            <div key={participant.id} className="flex justify-between items-center p-2 border rounded-lg">
              {/* 🐠 물고기 이미지 + 유저 정보 */}
              <div className="flex items-center gap-3">
                <img 
                  src={participant.fishImage && participant.fishImage.trim() !== '' ? participant.fishImage : '/fish/default.png'}
                  alt="대표 물고기"
                  className="w-8 h-8 rounded-full border"
                />
                <div>
                  <p className="text-xs text-gray-600">Lv.{participant.level}</p> {/* 레벨 */}
                  <p className="text-lg font-bold">{participant.nickname}</p> {/* 닉네임 */}
                  <p className="text-sm text-gray-500">{participant.id}</p> {/* 유저 ID */}
                </div>
              </div>

              {/* 제거 버튼 */}
              <button
                className="px-3 py-1 rounded border border-black text-black bg-white hover:bg-gray-200"
                onClick={() => handleRemoveParticipant(participant.id)}
              >
                제거
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">참가자가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
