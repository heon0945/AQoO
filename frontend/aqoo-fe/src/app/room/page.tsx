'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateChatRoom() {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!userName) return;
    setLoading(true);
    try {
      // 백엔드 REST API 호출 (POST http://localhost:8089/api/v1/chatrooms?userId=)
      // 현재 백엔드 API는 쿼리 파라미터로 userId를 받습니다.
      const response = await fetch(`http://localhost:8089/api/v1/chatrooms?userId=${encodeURIComponent(userName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Room creation failed');
      }
      const data = await response.json();
      // ChatRoomDto 형태의 응답에서 roomId를 추출 (예: data.roomId)
      const roomId = data.roomId;
      console.log('Created roomId:', roomId);
      // 채팅방 페이지로 이동 (URL: /room/{roomId}?userName=...&isHost=true)
      router.push(`/room/${roomId}?userName=${encodeURIComponent(userName)}&isHost=true`);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Create a Chat Room</h1>
      <input
        type="text"
        placeholder="Enter your username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="p-2 border rounded mb-4 w-full max-w-md"
      />
      <button
        onClick={handleCreateRoom}
        disabled={!userName || loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {loading ? 'Creating...' : 'Create Chat Room'}
      </button>
    </div>
  );
}
