'use client';

import { getStompClient } from '@/lib/stompclient';
import { useCallback, useEffect, useState } from 'react';

interface GameProps {
  roomId: string;
  userName: string;
  onResultConfirmed: () => void; // 결과 확인 후 호출할 콜백
}

interface RoomResponse {
  roomId: string;
  // players 배열: 각 플레이어의 userName과 totalPressCount 포함
  players: { userName: string; totalPressCount: number }[];
  message: string;
}

export default function Game({
  roomId,
  userName,
  onResultConfirmed,
}: GameProps) {
  const [pressCount, setPressCount] = useState(0);
  const [players, setPlayers] = useState<
    { userName: string; totalPressCount: number }[]
  >([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // 스페이스바 누르면 tap 카운트 증가 및 press 메시지 전송
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' && !gameEnded) {
        e.preventDefault();
        setPressCount((prev) => prev + 1);
        const client = getStompClient();
        if (client && client.connected) {
          const pressMessage = { roomId, userName, pressCount: 1 };
          client.publish({
            destination: '/app/game.press',
            body: JSON.stringify(pressMessage),
          });
          console.log('Press message sent:', pressMessage);
        } else {
          console.error('STOMP client is not connected yet.');
        }
      }
    },
    [roomId, userName, gameEnded]
  );

  useEffect(() => {
    window.addEventListener('keyup', handleKeyPress);
    return () => window.removeEventListener('keyup', handleKeyPress);
  }, [handleKeyPress]);

  // 백엔드에서 전송되는 RoomResponse 메시지를 구독하여 게임 진행 및 종료 처리
  useEffect(() => {
    const client = getStompClient();
    if (client) {
      const subscription = client.subscribe(
        `/topic/room/${roomId}`,
        (message) => {
          const data: RoomResponse = JSON.parse(message.body);
          console.log('Room update received:', data);
          setPlayers(data.players);
          if (data.message === 'GAME_ENDED') {
            // 예시로 총 tap 수가 100 이상인 플레이어를 승리자로 결정
            const winningPlayer = data.players.find(
              (player) => player.totalPressCount >= 100
            );
            console.log('winningPlayer:', winningPlayer);
            if (winningPlayer) {
              setGameEnded(true);
              setWinner(winningPlayer.userName);
            }
          }
        }
      );
      return () => subscription.unsubscribe();
    }
  }, [roomId]);

  useEffect(() => {
    console.log('Winner state updated:', winner);
  }, [winner]);

  const handleResultCheck = () => {
    // 결과 확인 버튼 클릭 시, 상위 컴포넌트(IntegratedRoom)로 결과 확인 이벤트 전달
    onResultConfirmed();
  };

  // 게임 종료 화면
  if (gameEnded) {
    return (
      <div className='p-4 mt-4 bg-white rounded shadow text-center'>
        <h3 className='mb-2 text-xl font-bold'>Game Over</h3>
        <p className='mb-4'>
          Winner: <span className='font-bold'>{winner || 'No Winner'}</span>
        </p>
        <button
          onClick={handleResultCheck}
          className='px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition-colors'
        >
          Check Result & Exit
        </button>
      </div>
    );
  }

  // 게임 진행 화면
  return (
    <div className='p-4 mt-4 bg-white rounded shadow'>
      <h3 className='mb-2 text-xl font-bold'>Game in Progress</h3>
      <p>Your tap count (this session): {pressCount}</p>
      <div className='mt-4'>
        <h4 className='font-semibold'>Scoreboard:</h4>
        <ul>
          {players.map((player, index) => (
            <li key={index}>
              {player.userName}: {player.totalPressCount} taps
            </li>
          ))}
        </ul>
      </div>
      <p className='mt-2 text-sm text-gray-500'>
        Press the <span className='font-bold'>Spacebar</span> to tap!
      </p>
    </div>
  );
}
