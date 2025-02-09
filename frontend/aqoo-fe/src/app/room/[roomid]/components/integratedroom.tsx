'use client';

import { connectStompClient, getStompClient } from '@/lib/stompclient';
import { useEffect, useRef, useState } from 'react';
import Game from './game';

type ScreenState = 'chat' | 'countdown' | 'game';

interface RoomUpdate {
  roomId: string;
  message: string;
  // GAME_ENDED 메시지 관련 데이터는 Game 컴포넌트가 자체 처리합니다.
}

interface IntegratedRoomProps {
  roomId: string; // 백엔드에서 생성된 roomId (예: "e0ec13d4-9101-4ae0-a22f-681b8c0fe32f")
  userName: string;
  isHost: boolean; // 방장 여부
}

export default function IntegratedRoom({
  roomId,
  userName,
  isHost,
}: IntegratedRoomProps) {
  const [screen, setScreen] = useState<ScreenState>('chat');
  const [countdown, setCountdown] = useState<number>(3);
  const hasSentJoinRef = useRef(false);

  // STOMP 연결 활성화
  useEffect(() => {
    connectStompClient(() => {
      console.log('STOMP client activated from IntegratedRoom.');
    });
  }, []);

  // join 메시지 전송 및 구독 설정
  useEffect(() => {
    const client = getStompClient();
    if (client) {
      const intervalId = setInterval(() => {
        if (client.connected) {
          if (!hasSentJoinRef.current) {
            const joinMessage = { roomId, sender: userName };
            client.publish({
              destination: '/app/chat.joinRoom',
              body: JSON.stringify(joinMessage),
            });
            console.log('Join room message sent:', joinMessage);
            hasSentJoinRef.current = true;
          }
          // 게임 시작 관련 메시지 구독 (GAME_STARTED 이벤트 수신)
          client.subscribe(`/topic/room/${roomId}`, (message) => {
            const data: RoomUpdate = JSON.parse(message.body);
            console.log('Room update received:', data);
            if (data.message === 'GAME_STARTED') {
              setScreen('countdown');
            }
            // GAME_ENDED는 Game 컴포넌트에서 처리합니다.
          });
          clearInterval(intervalId);
        }
      }, 500);
      return () => clearInterval(intervalId);
    }
  }, [roomId, userName, isHost]);

  // Countdown 효과: countdown 후에 game 화면으로 전환
  useEffect(() => {
    if (screen === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setScreen('game');
      }
    }
  }, [screen, countdown]);

  // Game 컴포넌트에서 결과 확인 버튼 클릭 시 호출될 함수:
  const handleResultConfirmed = () => {
    // 게임 종료 후 채팅(또는 준비) 화면으로 전환
    setScreen('chat');
    setCountdown(3);
    // 추가로 상태 초기화나 cleanup이 필요하면 여기서 처리
  };

  if (screen === 'chat') {
    return (
      <div className='max-w-2xl mx-auto p-4 bg-white rounded shadow text-center'>
        <h2 className='text-2xl font-bold mb-4'>Chat Room: {roomId}</h2>
        <p className='mb-2'>Logged in as: {userName}</p>
        {isHost ? (
          <button
            onClick={() => {
              const client = getStompClient();
              if (client && client.connected) {
                client.publish({
                  destination: '/app/game.start',
                  body: JSON.stringify({ roomId }),
                });
                console.log('Game start message sent');
              } else {
                console.error('STOMP client is not connected yet.');
              }
            }}
            className='mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
          >
            Start Game
          </button>
        ) : (
          <button
            onClick={() => {
              const client = getStompClient();
              if (client && client.connected) {
                client.publish({
                  destination: '/app/chat.ready',
                  body: JSON.stringify({ roomId, sender: userName }),
                });
                console.log('Ready message sent');
              } else {
                console.error('STOMP client is not connected yet.');
              }
            }}
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
          >
            Ready
          </button>
        )}
        <p className='mt-4 text-gray-600'>
          Waiting for all members to be ready...
        </p>
      </div>
    );
  } else if (screen === 'countdown') {
    return (
      <div className='max-w-2xl mx-auto p-4 bg-white rounded shadow text-center'>
        <h2 className='text-2xl font-bold mb-4'>Get Ready!</h2>
        <p className='text-lg'>
          Game starts in {countdown} second{countdown > 1 ? 's' : ''}...
        </p>
      </div>
    );
  } else if (screen === 'game') {
    return (
      <div className='max-w-2xl mx-auto p-4 bg-white rounded shadow'>
        <Game
          roomId={roomId}
          userName={userName}
          onResultConfirmed={handleResultConfirmed}
        />
      </div>
    );
  } else {
    return null;
  }
}
