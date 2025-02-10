'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function CreateChatRoom() {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const kicked = searchParams.get('status') === 'kicked';
  const [showKickedModal, setShowKickedModal] = useState(kicked);

  const handleCloseModal = () => {
    setShowKickedModal(false);
    // URL에서 'status' 파라미터 제거
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('status');
    router.replace(currentUrl.toString());
  };

  const handleCreateRoom = async () => {
    if (!userName) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://i12e203.p.ssafy.io/api/v1/chatrooms?userId=${encodeURIComponent(
          userName
        )}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Room creation failed');
      }
      const data = await response.json();
      const roomId = data.roomId;
      console.log('Created roomId:', roomId);
      router.push(
        `/room/${roomId}?userName=${encodeURIComponent(userName)}&isHost=true`
      );
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 모달 팝업: 추방되었을 때 */}
      {showKickedModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50'>
          <div className='bg-white p-6 rounded shadow-md'>
            <p className='text-lg text-red-700 mb-4'>추방되었습니다.</p>
            <button
              onClick={handleCloseModal}
              className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
            >
              확인
            </button>
          </div>
        </div>
      )}
      <div className='min-h-screen flex items-center justify-center bg-gray-50 p-6'>
        <div className='bg-white shadow-md rounded px-8 py-8 max-w-md w-full'>
          <h1 className='text-3xl font-bold mb-6 text-gray-900 text-center'>
            Create a Chat Room
          </h1>
          <input
            type='text'
            placeholder='Enter your username'
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className='w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900'
          />
          <button
            onClick={handleCreateRoom}
            disabled={!userName || loading}
            className='w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-50'
          >
            {loading ? 'Creating...' : 'Create Chat Room'}
          </button>
        </div>
      </div>
    </>
  );
}
