'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getStompClient } from '@/lib/stompclient';

interface GameProps {
  roomId: string;
  userName: string;
}

interface RoomResponse {
  roomId: string;
  players: {
    userName: string;
    totalPressCount: number;
  }[];
  message: string;
}

export default function Game({ roomId, userName }: GameProps) {
  const [pressCount, setPressCount] = useState(0);
  const [players, setPlayers] = useState<{ userName: string; totalPressCount: number }[]>([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const router = useRouter();

  // "keyup" 이벤트 핸들러: 스페이스바를 눌렀다가 뗄 때 실행
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' && !gameEnded) {
        e.preventDefault();
        setPressCount((prev) => prev + 1);
        const client = getStompClient();
        if (client) {
          const pressMessage = {
            roomId,
            userName,
            pressCount: 1,
          };
          client.publish({
            destination: '/app/game.press',
            body: JSON.stringify(pressMessage),
          });
        }
      }
    },
    [roomId, userName, gameEnded]
  );

  useEffect(() => {
    window.addEventListener('keyup', handleKeyPress);
    return () => {
      window.removeEventListener('keyup', handleKeyPress);
    };
  }, [handleKeyPress]);

  // 방 업데이트(점수, 플레이어 목록) 구독
  useEffect(() => {
    const client = getStompClient();
    if (client) {
      const subscription = client.subscribe(`/topic/room/${roomId}`, (message) => {
        const data: RoomResponse = JSON.parse(message.body);
        setPlayers(data.players);
        // 승리 조건: 누군가의 총 tap 횟수가 100 이상이면 게임 종료
        const winningPlayer = data.players.find(
          (player) => player.totalPressCount >= 100
        );
        if (winningPlayer) {
          setGameEnded(true);
          setWinner(winningPlayer.userName);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [roomId]);

  // 게임 종료 시 결과 확인 버튼 클릭 -> 채팅방(준비 화면)으로 이동
  const handleResultCheck = () => {
    router.push('/chat'); // 실제 채팅방 URL에 맞게 수정하세요.
  };

  if (gameEnded) {
    return (
      <div className="p-4 mt-4 bg-white rounded shadow text-center">
        <h3 className="mb-2 text-xl font-bold">Game Over</h3>
        <p className="mb-4">
          Winner: <span className="font-bold">{winner}</span>
        </p>
        <button
          onClick={handleResultCheck}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
        >
          Check Result & Exit
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 mt-4 bg-white rounded shadow">
      <h3 className="mb-2 text-xl font-bold">Game in Progress</h3>
      <p>Your tap count (this session): {pressCount}</p>
      <div className="mt-4">
        <h4 className="font-semibold">Scoreboard:</h4>
        <ul>
          {players.map((player, index) => (
            <li key={index}>
              {player.userName}: {player.totalPressCount} taps
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Press the <span className="font-bold">Spacebar</span> to tap!
      </p>
    </div>
  );
}
