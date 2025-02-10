'use client';

import { useRecoilState } from "recoil";
import { participantsState, addedFriendsState, Friend } from "@/store/participantAtom";


export default function ParticipantList() {
  const [participants, setParticipants] = useRecoilState(participantsState);
  const [addedFriends, setAddedFriends] = useRecoilState(addedFriendsState);
  
  const handleRemoveParticipant = (participant: Friend) => {
    setParticipants(participants.filter((p) => p.id !== participant.id)); // 참가자 목록에서 제거
    setAddedFriends(addedFriends.filter((id) => id !== participant.id)); // 추가된 친구 목록에서 제거
  };
  
  return (
    <div className="w-96 h-[450px] bg-white bg-opacity-70 border border-black rounded-lg p-4">
      <p className="font-bold mb-2">참여자 목록</p>
      <div className="overflow-y-auto h-72 flex flex-col gap-2">
        {participants.length > 0 ? (
          participants.map((participant) => (
            <div key={participant.id} className="flex justify-between items-center px-2 border rounded-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={participant.fishImage?.trim() !== "" ? participant.fishImage : "/fish/default.png"}
                  alt="참가자 물고기"
                  className="w-8 h-8 rounded-full border"
                />
                <div>
                <p className="text-xs">Lv.{participant.level}</p>
                <p className="text-lg font-bold">{participant.nickname}</p>
                <p className="text-sm">{participant.id}</p>
                </div>
              </div>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleRemoveParticipant(participant)}
              >
                제거
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center text-2xl">참가자가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
