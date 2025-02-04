'use client';

interface ParticipantListProps {
  participants: string[];
  setParticipants: (participants: string[]) => void;
  addedFriends: string[];
  setAddedFriends: (friends: string[]) => void;
}

export default function ParticipantList({ participants, setParticipants, addedFriends, setAddedFriends }: ParticipantListProps) {
  const handleRemoveParticipant = (participant: string) => {
    setParticipants(participants.filter((p) => p !== participant)); // 참가자 목록에서 제거
    setAddedFriends(addedFriends.filter((f) => f !== participant)); // 친구 목록의 버튼 상태 복구
  };

  return (
    <div className="w-60 h-96 bg-white bg-opacity-70 border border-black rounded-lg p-4">
      <p className="font-bold mb-2">참여자 목록</p>
      <div className="overflow-y-auto h-72 flex flex-col gap-2">
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <div key={index} className="flex justify-between items-center p-2 border rounded-lg">
              <span>{participant}</span>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleRemoveParticipant(participant)}
              >
                제거
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">참가자가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
