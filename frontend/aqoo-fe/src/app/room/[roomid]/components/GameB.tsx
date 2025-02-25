'use client';

import { useSFX } from '@/hooks/useSFX';
import { getStompClient } from '@/lib/stompclient';
import axiosInstance from '@/services/axiosInstance';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface GameBPlayer {
  userName: string;
  score: number;
  mainFishImage: string;
  nickname: string;
}

interface RoomResponse {
  roomId: string;
  players: GameBPlayer[];
  message: string; // "GAME_B_STARTED" | "SCORE_UPDATED" | "GAME_B_ENDED"
  winner?: string;
  scoreOrder?: string[];
}

interface EatMessagePayload {
  roomId: string;
  userName: string;
  itemType: 'FEED' | 'STONE';
}

interface EndGameMessagePayload {
  roomId: string;
}

interface GameBProps {
  roomId: string;
  userName: string;
  user: {
    mainFishImage?: string;
    level?: number;
  };
  onResultConfirmed: () => void;
}

interface FallingItem {
  id: number;
  type: 'FEED' | 'STONE';
  x: number; // px 단위 x 좌표
  y: number; // px 단위 y 좌표
  speed: number; // 매 업데이트마다 떨어지는 속도(px)
}

const GameB: FC<GameBProps> = ({
  roomId,
  userName,
  user,
  onResultConfirmed,
}) => {
  const { play: levelUpSound } = useSFX('/sounds/levelupRank.mp3');

  // -----------------------------
  // (A) 3초 카운트다운
  // -----------------------------
  const [countdown, setCountdown] = useState(3);
  const [hasCountdownFinished, setHasCountdownFinished] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setHasCountdownFinished(true);
    }
  }, [countdown]);

  // -----------------------------
  // (B) 게임 진행 상태
  // -----------------------------
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // 카운트다운이 끝나면 게임 시작
  useEffect(() => {
    if (hasCountdownFinished) {
      setGameStarted(true);
    }
  }, [hasCountdownFinished]);

  // -----------------------------
  // (C) 게임 시간 50초 제한
  // -----------------------------
  const [gameTime, setGameTime] = useState(50);

  // 매 초마다 gameTime 감소
  useEffect(() => {
    if (gameStarted && !gameEnded && gameTime > 0) {
      const timer = setInterval(() => {
        setGameTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameEnded, gameTime]);

  // 50초가 지나면 게임 자동 종료
  useEffect(() => {
    if (gameTime <= 0 && gameStarted && !gameEnded) {
      const client = getStompClient();
      if (client && client.connected) {
        const payload: EndGameMessagePayload = { roomId };
        client.publish({
          destination: '/app/gameB.end',
          body: JSON.stringify(payload),
        });
      }
    }
  }, [gameTime, gameStarted, gameEnded, roomId]);

  // -----------------------------
  // (D) 플레이어 목록 & 점수
  // -----------------------------
  // 초기에는 자기 자신을 0점으로 기본 표시 (추가 유저 정보는 IntegratedRoom에서 설정)
  const [players, setPlayers] = useState<GameBPlayer[]>([
    {
      userName,
      score: 0,
      mainFishImage: user.mainFishImage || '',
      nickname: userName,
    },
  ]);

  // 내 점수
  const me = players.find((p) => p.userName === userName);
  const myScore = me?.score ?? 0;

  const [winner, setWinner] = useState<string | null>(null);
  const [scoreOrder, setScoreOrder] = useState<string[]>([]);
  const [finishOrderSnapshot, setFinishOrderSnapshot] = useState<string[]>([]);

  // -----------------------------
  // (E) 경험치/레벨 관련 상태
  // -----------------------------
  const [showExpModal, setShowExpModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [myExpInfo, setMyExpInfo] = useState<any>(null);
  const [myEarnedExp, setMyEarnedExp] = useState(0);
  const [myTicket, setMyTicket] = useState<number | null>(null);
  const [prevLevel] = useState<number>(user.level ?? 0);

  // -----------------------------
  // (F) 물고기 이동 및 떨어지는 아이템
  // -----------------------------
  const [fishX, setFishX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStunned, setIsStunned] = useState(false);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const itemIdRef = useRef(0);

  // 게임 루프 및 아이템 스폰 타이머 ref
  const gameLoopIntervalRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);

  // -----------------------------
  // (G) STOMP 통신
  // -----------------------------
  useEffect(() => {
    const client = getStompClient();
    if (!client) return;

    const subscription = client.subscribe(`/topic/room/${roomId}`, (msg) => {
      const data: RoomResponse = JSON.parse(msg.body);

      if (data.message === 'GAME_B_STARTED') {
        setPlayers(data.players);
      } else if (data.message === 'SCORE_UPDATED') {
        setPlayers(data.players);
      } else if (data.message === 'GAME_B_ENDED') {
        setPlayers(data.players);
        setGameEnded(true);
        setWinner(data.winner || null);
        setScoreOrder(data.scoreOrder || []);
        setFinishOrderSnapshot(data.scoreOrder || []);
      }
    });

    return () => subscription.unsubscribe();
  }, [roomId]);

  // IntegratedRoom에서 gameB.start를 처리하므로 여기서는 start 메시지 X

  // -----------------------------
  // (H) 게임 루프(아이템 이동)
  // -----------------------------
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    gameLoopIntervalRef.current = window.setInterval(() => {
      setFallingItems((prevItems) =>
        prevItems
          .map((item) => ({ ...item, y: item.y + item.speed }))
          .filter((item) => {
            const containerHeight = containerRef.current?.clientHeight || 0;
            return item.y < containerHeight;
          })
      );
    }, 30);
    return () => {
      if (gameLoopIntervalRef.current)
        clearInterval(gameLoopIntervalRef.current);
    };
  }, [gameStarted, gameEnded]);

  // -----------------------------
  // (I) 아이템 스폰
  // -----------------------------
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    spawnIntervalRef.current = window.setInterval(() => {
      const containerWidth = containerRef.current?.clientWidth || 0;
      const randomX = Math.random() * (containerWidth - 50);
      const randomType: 'FEED' | 'STONE' =
        Math.random() < 0.8 ? 'FEED' : 'STONE';

      const newItem: FallingItem = {
        id: itemIdRef.current++,
        type: randomType,
        x: randomX,
        y: 0,
        speed: 3 + Math.random() * 2,
      };
      setFallingItems((prev) => [...prev, newItem]);
    }, 1000);

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [gameStarted, gameEnded]);

  // 게임 종료 시 fallingItems 모두 제거
  useEffect(() => {
    if (gameEnded) {
      setFallingItems([]);
    }
  }, [gameEnded]);

  // -----------------------------
  // (J) 키 입력(좌우 이동) + 충돌 감지
  // -----------------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!gameStarted || isStunned || gameEnded) return;
      const containerWidth = containerRef.current?.clientWidth || 0;
      const step = 20;

      if (e.key === 'ArrowLeft') {
        setFishX((prev) => Math.max(prev - step, 0));
      } else if (e.key === 'ArrowRight') {
        setFishX((prev) => Math.min(prev + step, containerWidth - 50));
      }
    },
    [gameStarted, isStunned, gameEnded]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    const container = containerRef.current;
    if (!container) return;

    const containerHeight = container.clientHeight;
    const fishY = containerHeight - 70; // 물고기 높이 50 + 여유
    const fishWidth = 50;
    const fishHeight = 50;
    const fishLeft = fishX;
    const fishRight = fishX + fishWidth;

    fallingItems.forEach((item) => {
      const itemWidth = 30;
      const itemHeight = 30;
      const itemLeft = item.x;
      const itemRight = item.x + itemWidth;
      const itemTop = item.y;
      const itemBottom = item.y + itemHeight;

      const collision = !(
        fishRight < itemLeft ||
        fishLeft > itemRight ||
        fishY > itemBottom ||
        fishY + fishHeight < itemTop
      );

      if (collision) {
        setFallingItems((prev) => prev.filter((i) => i.id !== item.id));
        processCollision(item.type);
      }
    });
  }, [fallingItems, fishX, gameStarted, gameEnded]);

  // -----------------------------
  // (K) 충돌 이벤트 처리
  // -----------------------------
  const processCollision = (itemType: 'FEED' | 'STONE') => {
    const client = getStompClient();
    if (!client || !client.connected) return;

    if (itemType === 'STONE') {
      setIsStunned(true);
      setTimeout(() => setIsStunned(false), 1000);
    }

    const payload: EatMessagePayload = { roomId, userName, itemType };
    client.publish({
      destination: '/app/gameB.eat',
      body: JSON.stringify(payload),
    });
  };

  // -----------------------------
  // (L) 게임 종료 테스트 버튼 (테스트용)
  // -----------------------------
  const handleGameEnd = () => {
    const client = getStompClient();
    if (!client || !client.connected) return;
    const payload: EndGameMessagePayload = { roomId };
    client.publish({
      destination: '/app/gameB.end',
      body: JSON.stringify(payload),
    });
  };

  // -----------------------------
  // (M) 게임 종료 후 경험치 처리
  // -----------------------------
  useEffect(() => {
    if (gameEnded && scoreOrder.length > 0) {
      const rank = scoreOrder.indexOf(userName) + 1;
      if (rank <= 0) return;

      const earnedExp = rank === 1 ? 20 : rank === 2 ? 10 : rank === 3 ? 5 : 3;
      setMyEarnedExp(earnedExp);

      (async () => {
        try {
          const res = await axiosInstance.post('/users/exp-up', {
            userId: userName,
            earnedExp,
          });
          setMyExpInfo(res.data);
        } catch (err) {
          console.error('EXP error', err);
        }
      })();
    }
  }, [gameEnded, scoreOrder, userName]);

  // -----------------------------
  // (N) 채팅방 복귀
  // -----------------------------
  const handleResultCheck = useCallback(() => {
    onResultConfirmed();
  }, [onResultConfirmed]);

  // -----------------------------
  // (O) 모달 닫기 (경험치, 레벨업)
  // -----------------------------
  const handleExpModalClose = () => {
    setShowExpModal(false);
    if (!myExpInfo) return;
    if (myExpInfo.userLevel > prevLevel) {
      levelUpSound();
      setShowLevelUpModal(true);

      (async () => {
        try {
          const ticketRes = await axiosInstance.get(`/fish/ticket/${userName}`);
          setMyTicket(ticketRes.data.fishTicket);
        } catch (err) {
          console.error('Ticket error', err);
        }
      })();
    }
  };

  const handleLevelUpModalClose = () => {
    setShowLevelUpModal(false);
  };

  // -----------------------------
  // (P) 렌더링
  // -----------------------------
  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: 'lightblue',
        overflow: 'hidden',
      }}
    >
      {/* (1) 카운트다운 & 게임 설명 오버레이 */}
      {!hasCountdownFinished && !gameEnded && (
        <div className='absolute inset-0 flex flex-col justify-center items-center bg-white/80 z-20 p-4'>
          <div className='max-w-6xl w-full text-center bg-white/90 border-2 border-gray-600 rounded-lg shadow-lg p-6'>
            <h3 className='mb-4 text-lg md:text-2xl font-bold'>
              게임 설명 (GameB)
            </h3>
            <p className='text-lg md:text-xl text-gray-700 mt-4'>
              위에서 떨어지는 먹이(FEED)는 점수를 올려주고,
              <br />
              돌(STONE)을 맞으면 1초간 기절합니다.
              <br />
              좌우 화살표 키로 물고기를 움직여 더 많은 점수를 얻어보세요!
            </p>
            <p className='mt-8 text-2xl text-gray-800'>
              {countdown} 초 후 게임 시작
            </p>
          </div>
        </div>
      )}

      {/* (2) 중앙 상단에 남은 시간 & 내 점수 표시 */}
      {gameStarted && !gameEnded && (
        <div className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/70 px-4 py-2 rounded text-xl text-gray-800 z-30'>
          Time: {gameTime}s | My Score: {myScore}
        </div>
      )}

      {/* (3) 우측 상단 점수판 (항상 표시, 기본 0점부터) */}
      <div
        style={{
          position: 'absolute',
          top: '70px',
          right: '10px',
          background: 'rgba(255,255,255,0.8)',
          padding: '10px',
          borderRadius: '8px',
          zIndex: 30,
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 5 }}>Scoreboard</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {players.map((p) => (
            <li key={p.userName}>
              {p.nickname}: {p.score}
            </li>
          ))}
        </ul>
      </div>

      {/* (4) Falling items */}
      {fallingItems.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: 30,
            height: 30,
            backgroundImage:
              item.type === 'FEED'
                ? "url('/games/food.png')"
                : "url('/games/stone.png')",
            backgroundSize: 'cover',
            zIndex: 10,
          }}
        />
      ))}

      {/* (5) 플레이어의 대표 물고기 */}
      <div
        style={{
          position: 'absolute',
          left: fishX,
          bottom: 20,
          width: 50,
          height: 50,
          backgroundImage: `url(${
            user.mainFishImage || '/images/defaultFish.png'
          })`,
          backgroundSize: 'cover',
          filter: isStunned ? 'grayscale(100%)' : 'none',
          zIndex: 15,
        }}
      />

      {/* (6) 게임 종료 오버레이 */}
      {gameEnded && (
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-br'>
          <div className='bg-white/80 shadow-xl rounded-2xl p-10 text-center max-w-md w-full mx-4'>
            <h1 className='text-4xl font-extrabold text-gray-800 mb-6'>
              Game Over
            </h1>
            <p className='text-xl text-gray-600 mb-6'>
              Winner:{' '}
              <span className='font-bold text-gray-900'>
                {winner || 'No Winner'}
              </span>
            </p>
            {finishOrderSnapshot.length > 0 && (
              <div className='mb-8'>
                <h2 className='text-3xl font-bold text-gray-800 mb-4'>
                  전체 순위
                </h2>
                <div className='bg-gray-100 rounded-lg shadow-md p-4'>
                  <ol className='divide-y divide-gray-300'>
                    {finishOrderSnapshot.map((nickname, index) => {
                      // 해당 유저의 점수를 players 배열에서 찾습니다.
                      const player = players.find(
                        (p) => p.nickname === nickname
                      );
                      return (
                        <li
                          key={nickname}
                          className='py-2 flex justify-between items-center'
                        >
                          <span className='font-semibold text-gray-700'>
                            {index + 1}.
                          </span>
                          <span className='text-gray-900'>{nickname}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            )}
            <button
              onClick={handleResultCheck}
              className='w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-300'
            >
              채팅방으로 돌아가기
            </button>
          </div>

          {/* 경험치 획득 모달 */}
          {showExpModal && myExpInfo && (
            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50'>
              <div className='relative bg-white w-[350px] p-8 rounded-lg shadow-xl text-center'>
                <h2 className='text-2xl font-extrabold text-blue-700 mb-4'>
                  경험치 획득!
                </h2>
                <p className='text-lg text-gray-700 mb-2'>
                  획득 경험치: <strong>+{myEarnedExp}</strong>
                </p>
                <p className='text-lg text-gray-700 mb-2'>
                  현재 레벨: <strong>{myExpInfo.userLevel}</strong>
                </p>
                <p className='text-md text-gray-600'>
                  경험치:{' '}
                  <strong>
                    {myExpInfo.curExp} / {myExpInfo.expToNextLevel}
                  </strong>
                  &nbsp;({myExpInfo.expProgress.toFixed(2)}%)
                </p>
                <div className='mt-6'>
                  <button
                    onClick={handleExpModalClose}
                    className='px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors'
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 레벨업 모달 */}
          {showLevelUpModal && (
            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50'>
              <div className='relative bg-white w-[350px] p-8 rounded-lg shadow-xl text-center'>
                <h2 className='text-3xl font-extrabold text-black mb-2 flex justify-center items-center'>
                  🎉 <span className='mx-2'>레벨 업!</span> 🎉
                </h2>
                <p className='text-lg font-medium text-gray-700 mt-3'>
                  레벨{' '}
                  <span className='text-blue-500 font-bold'>
                    {myExpInfo?.userLevel}
                  </span>{' '}
                  달성!
                </p>
                <hr className='my-4 border-gray-300' />
                <p className='text-lg font-medium text-gray-600 mb-6'>
                  티켓 +3{' '}
                  {myTicket !== null && (
                    <span className='text-gray-700 ml-1'>
                      (현재 {myTicket}개)
                    </span>
                  )}
                </p>
                <button
                  onClick={handleLevelUpModalClose}
                  className='px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors'
                >
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* (7) 임시 게임 종료 버튼 (테스트용) */}
      {/* <button
        onClick={handleGameEnd}
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          zIndex: 30,
          padding: '5px 10px',
        }}
      >
        End Game
      </button> */}
    </div>
  );
};

export default GameB;
