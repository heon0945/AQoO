'use client';

import { useFriends } from "@/hooks/useFriends";
import { useRecoilState } from "recoil";
import { participantsState, addedFriendsState, Friend } from "@/store/participantAtom";

export default function FriendList() {
  const { data, isLoading, error } = useFriends();
  const friends = data?.friends ?? [];

  const [participants, setParticipants] = useRecoilState(participantsState);
  const [addedFriends, setAddedFriends] = useRecoilState(addedFriendsState);

  // 

  const handleAddParticipant = (friend: Friend) => {
    // 참가자 추가 최대 5명으로 제한
    if (participants.length >= 5) {
      alert("최대 5명까지만 초대할 수 있습니다!")
      return;
    }
    // 친구를 참가자로 추가하는 함수
    if (!participants.some((p) => p.id === friend.id)) {
      setParticipants([...participants, friend]); // 참가자 목록에 추가
      setAddedFriends([...addedFriends, friend.id]); // 추가된 친구 목록 업데이트
    }
  };

  if (isLoading) return <p>Loading friends...</p>;
  if (error) return <p>Error loading friends.</p>;

  return (
    <div className="w-96 h-[450px] bg-white bg-opacity-70 border border-black rounded-lg p-4">
      <p className="font-bold mb-2">친구 목록</p>
      <div className="overflow-y-auto h-[400px] flex flex-col gap-2">
        {friends?.map((friend) => (
          <div key={friend.id} className="flex justify-between items-center border border-black rounded px-2">
            {/* 물고기 이미지 + 유저 정보 */}
            <div className="flex items-center gap-3 p-1">
              <img 
                src={friend.fishImage?.trim() !== "" ? friend.fishImage : "/fish/default.png"}
                alt="기본 물고기"
                className="w-8 h-8 rounded-full border"
              />
              <div>
                <p className="text-xs">Lv.{friend.level}</p>
                <p className="text-lg font-bold">{friend.nickname}</p>
                <p className="text-sm">{friend.id}</p>
              </div>
            </div>

            {/* 추가 버튼 */}
            <button
              className={`px-3 py-1 rounded border bg-white ${
                addedFriends.includes(friend.id) ? 'border-gray-600 text-gray-500' : 'border-black text-black'
              } disabled:bg-white disabled:text-gray-500 disabled:border-gray-600`}
              onClick={() => handleAddParticipant(friend)}
              disabled={addedFriends.includes(friend.id)}
            >
              {addedFriends.includes(friend.id) ? '✔' : '추가'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
