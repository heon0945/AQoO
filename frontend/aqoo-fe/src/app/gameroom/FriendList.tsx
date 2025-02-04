'use client';

import { useState, useEffect } from 'react';

interface Friend {
  id: string;
  nickname: string;
  level: number;
  fishImage?: string;
}

interface FriendListProps {
  participants: string[];
  setParticipants: (participants: string[]) => void;
  addedFriends: string[];
  setAddedFriends: (addedFriends: string[]) => void;
}

export default function FriendList({ participants, setParticipants, addedFriends, setAddedFriends }: FriendListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // 백엔드 API가 준비되면 아래 fetch 코드 활성화
        /*
        const response = await fetch('/api/friends', { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }
        const data = await response.json();
        setFriends(data);
        */

        // 테스트용 코드
        setFriends([
          { id: 'user_1', nickname: '닉네임 1', level: 12, fishImage: '' },
          { id: 'user_2', nickname: '닉네임 2', level: 8, fishImage: '' },
          { id: 'user_3', nickname: '닉네임 3', level: 4, fishImage: '' },
          { id: 'user_4', nickname: '닉네임 4', level: 7, fishImage: '' },
        ]);
      } catch (error) {
        console.error('친구 목록 불러오기 오류:', error);
      }
    };

    fetchFriends(); // 함수 실행
  }, []);

  const handleAddParticipant = (friendNickname: string) => {
    if (!participants.includes(friendNickname)) {
      setParticipants([...participants, friendNickname]);
      setAddedFriends([...addedFriends, friendNickname]);
    }
  };

  return (
    <div className="w-80 h-[450px] bg-white bg-opacity-80 border border-black rounded-lg p-1">
      <p className="font-bold mb-2">친구 목록</p>
      <div className="overflow-y-auto h-[450] flex flex-col gap-2">
        {friends.map((friend) => (
          <div key={friend.id} className="flex justify-between items-center border border-black px-2 ">
            {/* 물고기 이미지 + 유저 정보 */}
            <div className="flex items-center gap-3 p-1">
              {/* 기본 물고기 이미지 적용 */}
              <img 
                src={friend.fishImage && friend.fishImage.trim() !== '' ? friend.fishImage : '/fish/default.png'}
                alt="기본본 물고기"
                className="w-8 h-8 rounded-full border"
              />
              {/* 닉네임, 레벨, 아이디 표시 */}
              <div>
                <p className="text-xs ">Lv.{friend.level}</p>
                <p className="text-lg font-bold">{friend.nickname}</p>
                <p className='text-md text-gray-600'>{friend.id}</p>
              </div>
            </div>

            {/* 추가 버튼 */}
            <button
              className={`px-3 py-1 rounded border bg-white
                ${addedFriends.includes(friend.nickname) ? 'border-gray-600 text-gray-500' : 'border-black text-black'} 
                disabled:bg-white disabled:text-gray-500 disabled:border-gray-600`}
              onClick={() => handleAddParticipant(friend.nickname)}
              disabled={addedFriends.includes(friend.nickname)}
            >
              {addedFriends.includes(friend.nickname) ? '✔' : '추가'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
