'use client';

import { useState } from 'react';
import FriendList from './FriendList';
import ParticipantList from './ParticipantList';

interface Participant {
  id: string;
  nickname: string;
  level: number;
  fishImage?: string;
}

export default function GameRoom() {
  const [participants, setParticipants] = useState<Participant[]>([]); // 참가자 목록 (✅ 중복 제거)
  const [addedFriends, setAddedFriends] = useState<string[]>([]); // 추가된 친구 상태 관리

  return (
    <div 
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center opacity-80" 
      style={{ backgroundImage: "url('/images/background.png')" }}
    >
      {/* 뒤로가기 버튼 */}
      <button className="absolute top-5 left-5 px-4 py-2 bg-white border-2 border-black rounded-lg shadow-md font-bold">
        BACK
      </button>

      {/* 채팅 패널 */}
      <div className="flex gap-10 px-6 py-10 bg-opacity-45 bg-green-400 border-2 border-blue-700 rounded-lg shadow-md">
        {/* 친구 목록 (참가자 목록과 버튼 상태를 관리) */}
        <FriendList 
          participants={participants} 
          setParticipants={setParticipants} 
          addedFriends={addedFriends} 
          setAddedFriends={setAddedFriends} 
        />

        {/* 참가자 목록 (참가자와 버튼 상태를 관리) */}
        <ParticipantList 
          participants={participants} 
          setParticipants={setParticipants} 
          addedFriends={addedFriends}  
          setAddedFriends={setAddedFriends} 
        />
      </div>

      {/* 방 만들기 버튼 */}
      <button className="mt-4 px-6 py-3 bg-green-500 border-2 border-black rounded-lg text-lg font-bold">
        방 만들기
      </button>
    </div>
  );
}
