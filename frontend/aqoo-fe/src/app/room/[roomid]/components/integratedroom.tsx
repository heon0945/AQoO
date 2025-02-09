'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getStompClient } from '@/lib/stompclient';
import Game from './game';

type ScreenState = 'chat' | 'countdown' | 'game' | 'result';

interface RoomUpdate {
  roomId: string;
  message: string;
  // 게임 종료 메시지에는 우승자와 최종 점수(플레이어 목록) 포함 (백엔드가 전송)
  winner?: string;
  players?: { userName: string; totalPressCount: number }[];
}

interface IntegratedRoomProps {
  roomId: string;       // 백엔드에서 생성된 roomId가 URL에 전달됨 (예: "e0ec13d4-9101-4ae0-a22f-681b8c0fe32f")
  userName: string;
  isHost: boolean;      // 방장 여부 (URL의 isHost 파라미터에 따라 결정됨)
}

export default function IntegratedRoom({ roomId: initialRoomId, userName, isHost }: IntegratedRoomProps) {
  // roomId는 URL에서 전달된 값을 그대로 사용 (항상 존재한다고 가정)
  const [roomId] = useState(initialRoomId);
  const [screen, setScreen] = useState<ScreenState>('chat');
  const [countdown, setCountdown] = useState<number>(3);
  const [gameResult, setGameResult] = useState<{ winner: string; players: { userName: string; totalPressCount: number }[] } | null>(null);
  const router = useRouter();
  // join 메시지가 한 번만 전송되도록 관리하는 ref (호스트와 참가자 모두 한 번씩 전송)
  const hasSentJoinRef = useRef(false);

  useEffect(() => {
    const client = getStompClient();
    if (client) {
      // roomId가 있으면, 아직 join 메시지를 보내지 않았다면 join 요청을 보냅니다.
      if (roomId && !hasSentJoinRef.current) {
        const joinMessage = { roomId, userName };
        client.publish({
          destination: '/app/chat.joinRoom',
          body: JSON.stringify(joinMessage),
        });
        console.log('Join room message sent:', joinMessage);
        hasSentJoinRef.current = true;
      }
      // 모든 클라이언트는 /topic/room/{roomId} 채널을 구독하여 게임 시작 및 종료 이벤트 수신
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const data: RoomUpdate = JSON.parse(message.body);
        console.log('Room update received:', data);
        if (data.message === 'GAME_STARTED') {
          setScreen('countdown');
        } else if (data.message === 'GAME_ENDED') {
          setGameResult({ winner: data.winner || '', players: data.players || [] });
          setScreen('result');
        }
        // 기타 준비 상태 업데이트 메시지도 처리 가능
      });
    }
  }, [roomId, userName, isHost]);

  // Countdown 효과: 3초 카운트다운 후 게임 화면으로 전환
  useEffect(() => {
    if (screen === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setScreen('game');
      }
    }
  }, [screen, countdown]);

  // 결과 확인 버튼: 게임 종료 후 채팅(준비) 화면으로 복귀
  const handleReturnToChat = () => {
    setScreen('chat');
    setCountdown(3);
    setGameResult(null);
    // 필요시 백엔드에 복귀 메시지 전송 가능
  };

  // 렌더링 분기
  if (screen === 'chat') {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Chat Room: {roomId}</h2>
        <p className="mb-2">Logged in as: {userName}</p>
        {/* 준비 상태 UI: 방장은 "Start Game" 버튼, 참가자는 "Ready" 버튼 */}
        {isHost ? (
          <button
            onClick={() => {
              const client = getStompClient();
              if (client && client.connected) {
                client.publish({
                  destination: '/app/game.start',
                  body: JSON.stringify({ roomId })
                });
                console.log("Game start message sent");
              } else {
                console.error("STOMP client is not connected yet.");
              }
            }}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
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
                  body: JSON.stringify({ roomId, sender: userName })
                });
                console.log("Ready message sent");
              } else {
                console.error("STOMP client is not connected yet.");
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Ready
          </button>
        )}
        <p className="mt-4 text-gray-600">Waiting for all members to be ready...</p>
      </div>
    );
  } else if (screen === 'countdown') {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Get Ready!</h2>
        <p className="text-lg">Game starts in {countdown} second{countdown > 1 ? 's' : ''}...</p>
      </div>
    );
  } else if (screen === 'game') {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
        <Game roomId={roomId} userName={userName} />
      </div>
    );
  } else if (screen === 'result' && gameResult) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Game Over</h2>
        <p className="mb-4">
          Winner: <span className="font-bold">{gameResult.winner}</span>
        </p>
        <button
          onClick={handleReturnToChat}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Confirm Result & Return to Chat Room
        </button>
      </div>
    );
  } else {
    return null;
  }
}
