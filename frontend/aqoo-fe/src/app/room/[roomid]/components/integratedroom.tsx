'use client';

import { connectStompClient, getStompClient } from '@/lib/stompclient';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Game from './game';

type ScreenState = 'chat' | 'game';

interface RoomUpdate {
  roomId: string;
  message: string;
  // 게임 관련 메시지와 함께 유저 목록 업데이트용 필드 추가
  users?: { userName: string; ready: boolean; isHost: boolean }[];
}

interface IntegratedRoomProps {
  roomId: string; // 예: "e0ec13d4-9101-4ae0-a22f-681b8c0fe32f"
  userName: string;
}

export default function IntegratedRoom({
  roomId,
  userName,
}: IntegratedRoomProps) {
  const [screen, setScreen] = useState<ScreenState>('chat');
  const [users, setUsers] = useState<
    { userName: string; ready: boolean; isHost: boolean }[]
  >([]);
  const [currentIsHost, setCurrentIsHost] = useState(false);
  const hasSentJoinRef = useRef(false);
  const router = useRouter();

  // STOMP 연결 활성화
  useEffect(() => {
    connectStompClient(() => {
      console.log('STOMP client activated from IntegratedRoom.');
    });
  }, []);

  // join 메시지 전송 및 구독 설정 (client 연결 후)
  useEffect(() => {
    const client = getStompClient();
    if (!client) return;

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
        const subscription = client.subscribe(
          `/topic/room/${roomId}`,
          (message) => {
            const data: RoomUpdate = JSON.parse(message.body);
            console.log('Room update received:', data);
            if (data.message === 'GAME_STARTED') {
              setScreen('game');
            } else if (data.message === 'USER_LIST') {
              setUsers(data.users ?? []);
            }
          }
        );
        clearInterval(intervalId);
        return () => subscription.unsubscribe();
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [roomId, userName]);

  // 매번 users가 업데이트될 때마다 현재 사용자의 isHost 값을 갱신합니다.
  useEffect(() => {
    const me = users.find((u) => u.userName === userName);
    setCurrentIsHost(me ? me.isHost : false);
  }, [users, userName]);

  // 상태 업데이트 시 사용자 객체 전체를 콘솔로 출력 (디버깅 용도)
  useEffect(() => {
    console.log('Updated users:', users);
    users.forEach((user) =>
      console.log(
        `User ${user.userName}: isHost = ${user.isHost}, ready = ${user.ready}`
      )
    );
  }, [users]);

  // 게임 종료 후 대기 화면으로 복귀 시 호출될 콜백
  const handleResultConfirmed = () => {
    setScreen('chat');

    const client = getStompClient();
    if (client && client.connected) {
      client.publish({
        destination: '/app/chat.clearReady',
        body: JSON.stringify({ roomId, sender: userName }),
      });
      console.log('Clear ready status message sent');
    } else {
      console.error('STOMP client is not connected yet.');
    }
  };

  // "채팅방 나가기" 버튼 클릭 시 처리 함수
  const handleLeave = () => {
    const client = getStompClient();
    if (client && client.connected) {
      client.publish({
        destination: '/app/chat.leaveRoom',
        body: JSON.stringify({ roomId, sender: userName }),
      });
      console.log('Leave room message sent');
      // 채팅방을 나간 후 홈으로 이동 (원하는 페이지로 변경 가능)
      router.push('/room');
    } else {
      console.error('STOMP client is not connected yet.');
    }
  };

  // 현재 사용자의 Ready 상태
  const myReady = users.find((u) => u.userName === userName)?.ready;

  // 방장의 Start 버튼 활성화를 위한 조건:
  // - 현재 사용자가 방장인 경우: 자신의 기록은 제외하고 나머지 사용자가 모두 ready 상태이면 true
  // - 방장이 아닌 경우: 방장이 아닌 사용자들 중 모두 ready 상태이면 true.
  const nonHostUsers = currentIsHost
    ? users.filter((u) => u.userName !== userName)
    : users.filter((u) => !u.isHost);
  const allNonHostReady =
    nonHostUsers.length === 0 || nonHostUsers.every((u) => u.ready);

  // 렌더링할 사용자 목록: 현재 사용자가 방장인데, users 배열에 포함되어 있지 않다면 추가
  const displayUsers =
    currentIsHost && !users.some((u) => u.userName === userName)
      ? [...users, { userName, ready: false, isHost: true }]
      : users;

  return (
    <>
      {screen === 'chat' && (
        <div className='max-w-2xl mx-auto p-6 bg-white rounded shadow text-center'>
          <h2 className='text-3xl font-bold mb-4 text-gray-900'>채팅방</h2>
          <p className='mb-4 text-lg text-gray-900'>
            Logged in as: <strong>{userName}</strong>{' '}
            {currentIsHost && <span className='ml-2 text-red-600'>(방장)</span>}
          </p>

          {/* 실시간 유저 목록 */}
          <div className='my-6'>
            <h3 className='text-xl font-semibold mb-2 text-gray-900'>
              채팅방 참여 목록
            </h3>
            <ul className='space-y-2'>
              {displayUsers.map((user) => (
                <li
                  key={user.userName}
                  className='flex justify-between items-center px-4 py-2 border rounded bg-gray-50'
                >
                  <span className='text-gray-900 font-medium'>
                    {user.userName}{' '}
                    {user.isHost && (
                      <span className='ml-1 text-sm font-bold text-red-600'>
                        (방장)
                      </span>
                    )}
                  </span>
                  {user.ready && (
                    <span className='text-green-700 font-bold'>Ready</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* 버튼 영역 */}
          <div className='mt-6 flex flex-col items-center space-y-4'>
            {currentIsHost ? (
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
                className={`w-full px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors ${
                  allNonHostReady ? '' : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!allNonHostReady}
              >
                Start Game
              </button>
            ) : (
              <button
                onClick={() => {
                  const client = getStompClient();
                  if (client && client.connected) {
                    if (myReady) {
                      // 이미 준비 상태이면 unready 처리
                      client.publish({
                        destination: '/app/chat.unready',
                        body: JSON.stringify({ roomId, sender: userName }),
                      });
                      console.log('Unready message sent');
                    } else {
                      // 준비 상태가 아니면 ready 처리
                      client.publish({
                        destination: '/app/chat.ready',
                        body: JSON.stringify({ roomId, sender: userName }),
                      });
                      console.log('Ready message sent');
                    }
                  } else {
                    console.error('STOMP client is not connected yet.');
                  }
                }}
                className='w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                {myReady ? 'Unready' : 'Ready'}
              </button>
            )}
            {/* 채팅방 나가기 버튼 */}
            <button
              onClick={handleLeave}
              className='w-full px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
            >
              Leave Chat Room
            </button>
          </div>

          {currentIsHost ? (
            <p className='mt-4 text-base text-gray-800'>
              {allNonHostReady
                ? 'Start Game 버튼을 누르면 게임을 시작할 수 있습니다.'
                : '참가자들이 모두 Ready 하여야 시작할 수 있습니다.'}
            </p>
          ) : (
            <p className='mt-4 text-base text-gray-800'>
              {myReady
                ? 'Unready 버튼을 눌러 준비를 취소할 수 있습니다.'
                : 'Ready 버튼을 눌러 게임 준비를 할 수 있습니다.'}
            </p>
          )}
        </div>
      )}

      {screen === 'game' && (
        <div className='max-w-2xl mx-auto p-6 bg-white rounded shadow'>
          <Game
            roomId={roomId}
            userName={userName}
            onResultConfirmed={handleResultConfirmed}
          />
        </div>
      )}
    </>
  );
}
