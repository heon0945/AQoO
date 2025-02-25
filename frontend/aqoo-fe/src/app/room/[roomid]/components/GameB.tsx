'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStompClient } from '@/lib/stompclient';
import { User } from '@/store/authAtom';

interface GameBProps {
  roomId: string;
  userName: string;
  user: User;
}

interface GamePlayerDto {
  userName: string;
  score: number;
  direction: string; // "LEFT", "RIGHT", "IDLE"
  stunned: boolean;
}

interface GameStateUpdateDto {
  roomId: string;
  remainingTime: number;
  playerStates: GamePlayerDto[];
  message: string; // "GAME_STATE_UPDATE"
}

interface FinalResultDto {
  roomId: string;
  ranking: GamePlayerDto[];
  message: string; // "GAME_ENDED"
}

export default function GameB({ roomId, userName, user }: GameBProps) {
  // countdown 상태 (옵션으로 짧은 준비시간 제공)
  const [countdown, setCountdown] = useState<number>(3);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  
  // 서버에서 전송한 게임 상태 업데이트 저장
  const [gameState, setGameState] = useState<GameStateUpdateDto | null>(null);
  // 게임 종료 여부 및 최종 결과
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<FinalResultDto | null>(null);

  // Countdown 처리: countdown이 끝나면 게임 시작 상태로 전환
  useEffect(() => {
    console.log('[GameB] countdown:', countdown);
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      console.log('[GameB] Countdown finished, setting game as started');
      setHasStarted(true);
      // IntegratedRoom에서 이미 게임 시작 메시지를 보내므로 여기서는 별도 publish 없음.
    }
  }, [countdown]);

  // STOMP 구독: 서버에서 메시지 수신하여 상태 업데이트 처리
  useEffect(() => {
    const client = getStompClient();
    if (client) {
      const sub = client.subscribe(`/topic/room/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        console.log('[GameB] Received message:', data);
        if (data.message === 'GAME_ENDED') {
          // 게임 종료 메시지 수신: 최종 결과 처리
          setGameEnded(true);
          setFinalResult(data);
          setGameState(null);
        } else if (data.message === 'GAME_STATE_UPDATE') {
          // 일반 게임 상태 업데이트 메시지 수신
          setGameState(data);
        } else {
          console.warn('[GameB] Unhandled message type:', data.message);
        }
      });
      return () => sub.unsubscribe();
    }
  }, [roomId]);

  // 좌우 이동 이벤트: 사용자가 화살표 키를 누르면 이동 요청 전송
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!hasStarted || gameEnded) return;
      let direction = '';
      if (e.key === 'ArrowLeft') {
        direction = 'LEFT';
      } else if (e.key === 'ArrowRight') {
        direction = 'RIGHT';
      }
      if (direction) {
        e.preventDefault();
        console.log('[GameB] Key pressed:', e.key, 'Direction:', direction);
        const client = getStompClient();
        if (client && client.connected) {
          client.publish({
            destination: '/app/gameB.move',
            body: JSON.stringify({ roomId, userName, direction }),
          });
        }
      }
    },
    [hasStarted, gameEnded, roomId, userName]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 게임 시작 전 화면: countdown 표시
  if (!hasStarted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <h1 className="text-4xl font-bold">Starting in {countdown}...</h1>
      </div>
    );
  }

  // 게임 종료 후 최종 결과 화면
  if (gameEnded && finalResult) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Game Over</h1>
        <h2 className="text-2xl mb-4">
          Winner: {finalResult.ranking[0]?.userName || 'No Winner'}
        </h2>
        <div className="bg-white shadow-md rounded p-4">
          <ol className="list-decimal">
            {finalResult.ranking.map((player, index) => (
              <li key={player.userName} className="py-1">
                {index + 1}. {player.userName} - {player.score} pts
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  // 게임 진행 중 화면: 남은 시간 및 각 플레이어의 상태 렌더링
  console.log('[GameB] Rendering game state:', gameState);
  return (
    <div className="relative w-full h-screen bg-blue-100 overflow-hidden">
      {/* 남은 시간 표시 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow">
        <span className="text-xl">
          Time: {gameState ? gameState.remainingTime : 0}s
        </span>
      </div>

      {/* 플레이어 상태 표시 */}
      {gameState?.playerStates && (
        <div className="absolute inset-0 flex flex-col items-center">
          {gameState.playerStates.map((player, index) => {
            const leftPos = 10 + player.score * 0.5;
            const topPos = 150 + index * 80;
            console.log(`[GameB] Rendering player ${player.userName}: score=${player.score}, stunned=${player.stunned}`);
            return (
              <div
                key={player.userName}
                className="absolute flex flex-col items-center"
                style={{ left: `${leftPos}%`, top: `${topPos}px` }}
              >
                <img
                  src="/chat_images/fish_default.png"
                  alt={player.userName}
                  className={`w-16 h-16 object-contain ${player.stunned ? 'opacity-50' : ''}`}
                />
                <span className="mt-1 font-medium">
                  {player.userName} ({player.score})
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 하단 안내 메시지 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow">
        <p className="text-lg">
          Use <strong>Left</strong> / <strong>Right</strong> arrow keys to move.
        </p>
      </div>
    </div>
  );
}
