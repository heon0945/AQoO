'use client';

import { useSFX } from '@/hooks/useSFX';
import { getStompClient } from '@/lib/stompclient';
import axiosInstance from '@/services/axiosInstance';
import { User } from '@/store/authAtom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface GameAPlayer {
  userName: string;
  totalPressCount: number; // 서버 점수 == 내가 맞춘 횟수
  mainFishImage: string;
  nickname: string;
}

interface ExpResponse {
  curExp: number;
  expToNextLevel: number;
  expProgress: number;
  userLevel: number;
  message: string;
}

interface TicketResponse {
  userId: string;
  fishTicket: number;
}

interface RoomResponse {
  roomId: string;
  players: GameAPlayer[];
  message: string; // 'PRESS_UPDATED' | 'GAME_ENDED'...
  winner?: string;
  finishOrder?: string[];
  directionSequence?: number[];
}

interface GameAProps {
  roomId: string;
  userName: string;
  initialPlayers: GameAPlayer[];
  initialDirectionSequence: number[];
  onResultConfirmed: () => void;
  user: User;
}

/** 방향 번호 -> 아이콘 변환 */
const getArrowIcon = (direction: number) => {
  switch (direction) {
    case 0:
      return '↑';
    case 1:
      return '→';
    case 2:
      return '↓';
    case 3:
      return '←';
    default:
      return '';
  }6
};

export default function GameA({
  roomId,
  userName,
  initialPlayers,
  initialDirectionSequence,
  onResultConfirmed,
  user,
}: GameAProps) {
  // --- (기존 로직들: 상태, 모달, 타이머 등) ---
  const [prevLevel] = useState<number>(user.level ?? 0);

  // 모달
  const [showExpModal, setShowExpModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [myTicket, setMyTicket] = useState<number | null>(null);
  const [myExpInfo, setMyExpInfo] = useState<ExpResponse | null>(null);
  const [myEarnedExp, setMyEarnedExp] = useState<number>(0);

  // 게임 진행
  const [countdown, setCountdown] = useState(3);
  const [hasCountdownFinished, setHasCountdownFinished] = useState(false);
  const [currentPlayers, setCurrentPlayers] =
    useState<GameAPlayer[]>(initialPlayers);
  const directionSequence = initialDirectionSequence;

  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [finishOrder, setFinishOrder] = useState<string[]>([]);
  const [finishOrderSnapshot, setFinishOrderSnapshot] = useState<string[]>([]);

  const [isStunned, setIsStunned] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [gameTime, setGameTime] = useState(3600);
  const [modalDismissed, setModalDismissed] = useState(false);

  // 트랙 크기
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackDims, setTrackDims] = useState({ width: 0, height: 0 });
  const totalLanes = 6;
  const laneAreaFactor = 0.7;
  const laneAreaHeight = trackDims.height * laneAreaFactor;
  const laneAreaTopOffset = (trackDims.height - laneAreaHeight) / 2;
  const laneHeight = laneAreaHeight ? laneAreaHeight / totalLanes : 120;

  // 사운드
  const { play: correctSound } = useSFX('/sounds/clickeffect-03.mp3');
  const { play: errorSound } = useSFX('/sounds/짜잔.mp3');
  const { play: levelUpSound } = useSFX('/sounds/levelupRank.mp3');

  // 꼭 넣어주라고 하신 부분
  useEffect(() => {
    setCurrentPlayers(initialPlayers);
  }, [initialPlayers]);

  // (1) 트랙 크기 측정
  useEffect(() => {
    function updateDims() {
      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        setTrackDims({ width: rect.width, height: rect.height });
      }
    }
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  // (2) STOMP 구독
  useEffect(() => {
    const client = getStompClient();
    if (!client) return;

    const subscription = client.subscribe(`/topic/room/${roomId}`, (msg) => {
      const data: RoomResponse = JSON.parse(msg.body);
      if (data.message === 'PRESS_UPDATED' && data.players) {
        setCurrentPlayers(data.players);
      } else if (data.message === 'GAME_ENDED') {
        setGameEnded(true);
        setCurrentPlayers(data.players || []);
        setFinishOrder(data.finishOrder || []);
        setWinner(data.winner || null);
      }
    });

    return () => subscription.unsubscribe();
  }, [roomId]);

  // (3) 카운트다운
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    setHasCountdownFinished(true);
  }, [countdown]);

  // (4) 카운트다운 끝나면 /app/chat.clearReady
  useEffect(() => {
    if (hasCountdownFinished) {
      const client = getStompClient();
      if (client && client.connected) {
        client.publish({
          destination: '/app/chat.clearReady',
          body: JSON.stringify({ roomId, sender: userName }),
        });
      }
    }
  }, [hasCountdownFinished, roomId, userName]);

  // (5) me, hasArrived
  const me = currentPlayers.find((p) => p.userName === userName);
  const hasArrived = me ? me.totalPressCount >= 100 : false;

  // (A) “슬라이드 인덱스”를 관리 (기본은 0)
  //     매번 me.totalPressCount가 바뀔 때, 해당 값으로 갱신
  const [slideIndex, setSlideIndex] = useState(0);
  const prevPressCountRef = useRef<number>(me?.totalPressCount || 0);

  const currentDirection = useMemo(() => {
    if (!me || !directionSequence) return null;
    const idx = me.totalPressCount;
    return directionSequence[idx] ?? null;
  }, [me, directionSequence]);

  // me가 변할 때마다, totalPressCount 변화를 감지해서 slideIndex 갱신
  useEffect(() => {
    if (me) {
      if (prevPressCountRef.current !== me.totalPressCount) {
        setSlideIndex(me.totalPressCount);
        prevPressCountRef.current = me.totalPressCount;
      }
    }
  }, [me]);

  // (B) 실제 표시할 방향 배열: 현재 인덱스 ~ 다음 5개
  //     (전체를 표시해도 되지만, 여기서는 6개만 표시)
  const displayedDirections = useMemo(() => {
    if (!directionSequence || !me) return [];
    return directionSequence.slice(me.totalPressCount, me.totalPressCount + 6);
  }, [directionSequence, me]);

  // 한 아이템의 가로 폭
  const itemWidth = 40;

  // (6) 현재 목표
  const currentTarget = useMemo(() => {
    if (!directionSequence || !me) return null;
    const idx = me.totalPressCount;
    if (idx >= directionSequence.length) return null;
    return directionSequence[idx];
  }, [directionSequence, me]);

  // (7) 키 입력 핸들러
  const handleArrowKey = useCallback(
    (e: KeyboardEvent) => {
      if (gameEnded || !hasCountdownFinished) return;
      let direction: number | null = null;
      if (e.key === 'ArrowUp') direction = 0;
      if (e.key === 'ArrowRight') direction = 1;
      if (e.key === 'ArrowDown') direction = 2;
      if (e.key === 'ArrowLeft') direction = 3;
      if (direction === null) return;

      if (isStunned) return;
      if (!hasStarted) setHasStarted(true);

      if (currentTarget !== null && direction === currentTarget) {
        correctSound();
        const client = getStompClient();
        if (client && client.connected) {
          client.publish({
            destination: '/app/gameA.press',
            body: JSON.stringify({ roomId, userName, direction }),
          });
        }
      } else {
        errorSound();
        setIsStunned(true);
        setTimeout(() => setIsStunned(false), 1000);
      }
    },
    [
      gameEnded,
      hasCountdownFinished,
      isStunned,
      hasStarted,
      currentTarget,
      correctSound,
      errorSound,
      roomId,
      userName,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleArrowKey);
    return () => window.removeEventListener('keydown', handleArrowKey);
  }, [handleArrowKey]);

  // (8) 게임 타이머
  useEffect(() => {
    if (!hasStarted || gameEnded) return;
    const timer = setInterval(() => {
      setGameTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, gameEnded]);

  // 타임아웃 -> 서버 endGame
  useEffect(() => {
    if (gameTime <= 0 && !gameEnded && hasStarted) {
      const client = getStompClient();
      if (client && client.connected) {
        client.publish({
          destination: '/app/gameA.end',
          body: JSON.stringify({ roomId }),
        });
      }
    }
  }, [gameTime, gameEnded, hasStarted, roomId]);

  // (9) gameEnded 후 -> finishOrder -> 경험치
  useEffect(() => {
    if (!gameEnded || finishOrder.length === 0) return;
    const rank = finishOrder.indexOf(userName) + 1;
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
  }, [gameEnded, finishOrder, userName]);

  // (10) finishOrderSnapshot
  useEffect(() => {
    if (
      gameEnded &&
      finishOrder.length > 0 &&
      finishOrderSnapshot.length === 0
    ) {
      const snapshot = finishOrder.map((u) => {
        const p = currentPlayers.find((x) => x.userName === u);
        return p ? p.nickname : u;
      });
      setFinishOrderSnapshot(snapshot);
    }
  }, [gameEnded, finishOrder, finishOrderSnapshot, currentPlayers]);

  // (11) 도착 모달
  const handleModalClose = () => setModalDismissed(true);
  const handleResultCheck = () => onResultConfirmed();

  // (12) 경험치 & 레벨업 모달
  useEffect(() => {
    if (myExpInfo) {
      setShowExpModal(true);
      errorSound();
    }
  }, [myExpInfo, errorSound]);

  const handleExpModalClose = () => {
    setShowExpModal(false);
    if (!myExpInfo) return;
    if (myExpInfo.userLevel > prevLevel) {
      levelUpSound();
      setShowLevelUpModal(true);

      // 티켓 +3
      (async () => {
        try {
          const ticketRes = await axiosInstance.get(`/fish/ticket/${userName}`);
          const ticketData: TicketResponse = ticketRes.data;
          setMyTicket(ticketData.fishTicket);
        } catch (err) {
          console.error('Ticket error', err);
        }
      })();
    }
  };

  const handleLevelUpModalClose = () => {
    setShowLevelUpModal(false);
  };

  // --- 게임 종료 화면 ---
  if (gameEnded) {
    return (
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
                  {finishOrderSnapshot.map((nickname, index) => (
                    <li
                      key={nickname}
                      className='py-2 flex justify-between items-center'
                    >
                      <span className='font-semibold text-gray-700'>
                        {index + 1}.
                      </span>
                      <span className='text-gray-900'>{nickname}</span>
                    </li>
                  ))}
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
                티켓 +3
                {myTicket !== null && (
                  <span className='text-gray-700 ml-1'>
                    (현재 {myTicket}개)
                  </span>
                )}
              </p>
              <button
                onClick={() => handleLevelUpModalClose()}
                className='px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors'
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- 게임 진행 중 화면 ---
  return (
    <div
      className='w-full h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden'
      style={{ backgroundImage: "url('/chat_images/game_bg.gif')" }}
      ref={trackRef}
    >
      {/* 100점 도달했지만 게임 안끝났을때 */}
      {!gameEnded && hasArrived && !modalDismissed && (
        <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30'>
          <div className='bg-white p-8 rounded-lg shadow-lg text-center'>
            <h2 className='text-2xl font-bold mb-4'>결승점 도착!</h2>
            <p className='text-xl mb-4'>
              다른 플레이어들이 도착할 때까지 기다려주세요!
            </p>
            <button
              onClick={() => setModalDismissed(true)}
              className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded'
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 트랙 라인 */}
      {trackDims.height > 0 && (
        <>
          <div
            className='absolute pointer-events-none'
            style={{
              left: trackDims.width * 0.1,
              top: laneAreaTopOffset,
              height: laneAreaHeight,
            }}
          >
            <div className='h-full border-l-4 border-green-500'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-green-500 font-bold text-lg bg-white/70 px-2 py-1 rounded'>
                Start
              </span>
            </div>
          </div>
          <div
            className='absolute pointer-events-none'
            style={{
              left: trackDims.width * 0.9,
              top: laneAreaTopOffset,
              height: laneAreaHeight,
            }}
          >
            <div className='h-full border-l-4 border-red-500'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-red-500 font-bold text-lg bg-white/70 px-2 py-1 rounded'>
                Goal
              </span>
            </div>
          </div>
          <div
            className='absolute left-0 w-full border-t border-gray-300 pointer-events-none'
            style={{ top: `${laneAreaTopOffset}px`, zIndex: 2 }}
          />
          {Array.from({ length: totalLanes - 1 }).map((_, i) => (
            <div
              key={i}
              className='absolute left-0 w-full border-t border-gray-300 pointer-events-none'
              style={{
                top: `${laneAreaTopOffset + (i + 1) * laneHeight}px`,
                zIndex: 2,
              }}
            />
          ))}
          <div
            className='absolute left-0 w-full border-t border-gray-300 pointer-events-none'
            style={{
              top: `${laneAreaTopOffset + laneAreaHeight}px`,
              zIndex: 2,
            }}
          />
        </>
      )}

      {/* 플레이어 표시 */}
      {currentPlayers.map((player) => {
        const offset =
          currentPlayers.length < totalLanes
            ? Math.floor((totalLanes - currentPlayers.length) / 2)
            : 0;
        const laneIndex = currentPlayers.indexOf(player) + offset;
        const fishSize = laneHeight * 0.8;
        const topPos =
          laneAreaTopOffset +
          laneIndex * laneHeight +
          (laneHeight - fishSize) / 2;

        const startOffset = trackDims.width * 0.1;
        const moveFactor = trackDims.width * 0.016;

        const leftPos =
          player.nickname === userName && !hasStarted
            ? startOffset
            : startOffset + Math.floor(player.totalPressCount / 2) * moveFactor;

        return (
          <div
            key={player.nickname}
            className='absolute'
            style={{ top: `${topPos}px`, left: `${leftPos}px`, zIndex: 10 }}
          >
            <div
              className='relative'
              style={{ width: fishSize, height: fishSize }}
            >
              <img
                src={player.mainFishImage}
                alt={`${player.nickname}의 대표 물고기`}
                style={{ width: fishSize, height: fishSize }}
                className='object-contain scale-x-[-1]'
              />
            </div>
            <span
              className='absolute text-xl font-medium text-gray-900 whitespace-nowrap'
              style={{
                top: `${fishSize - 16}px`,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              {player.nickname}
            </span>
          </div>
        );
      })}

      {/* 현재 방향 + 다음 방향(최대 5개) 슬라이드  */}
      {hasCountdownFinished && !gameEnded && displayedDirections.length > 0 && (
        <div className='absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/70 backdrop-blur-md rounded-full shadow-lg px-4 py-2 flex flex-col items-center gap-2'>
          {/* 남은 시간 표시 */}
          <div className='text-lg font-semibold text-gray-700 flex items-center gap-4'>
            <span className='px-3 py-1 bg-blue-100 text-blue-600 rounded-full shadow'>
              TIME: {gameTime}s
            </span>
          </div>

          {/* 슬라이드 영역: 현재 및 앞으로 눌러야 할 방향키만 표시 */}
          <div className='relative w-[200px] h-10 overflow-hidden'>
            <div className='flex gap-2'>
              {directionSequence
                .slice(me?.totalPressCount || 0)
                .map((dir, i) => (
                  <div
                    key={i}
                    className={`w-[40px] h-10 flex items-center justify-center text-2xl font-bold ${
                      i === 0 ? 'text-red-600' : 'text-gray-800'
                    }`}
                  >
                    {getArrowIcon(dir)}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 디버그 */}
      {/* <div className='absolute bottom-4 left-4 bg-white/80 p-2 rounded text-sm z-50'>
        <pre>
          {JSON.stringify(
            {
              countdown,
              hasCountdownFinished,
              hasStarted,
              gameEnded,
              slideIndex,
              displayedDirections,
              currentPlayers,
            },
            null,
            2
          )}
        </pre>
      </div> */}

      {/* 카운트다운 오버레이 */}
      {!hasCountdownFinished && (
        <div className='absolute inset-0 flex flex-col justify-center items-center bg-white/80 z-20 p-4'>
          <div className='max-w-6xl w-full text-center bg-white/90 border-2 border-gray-600 rounded-lg shadow-lg p-6'>
            <h3 className='mb-4 text-lg md:text-2xl font-bold flex items-center justify-center'>
              <img
                src='/chat_images/game_stick.png'
                alt='방향키'
                className='w-10 md:w-14 h-auto mx-2 inline-block'
              />
              게임 설명
              <img
                src='/chat_images/game_stick.png'
                alt='방향키'
                className='w-10 md:w-14 h-auto mx-2 inline-block'
              />
            </h3>
            <p className='text-lg md:text-2xl font-medium text-gray-800 mt-4'>
              방향키 맞추기 게임에 오신 걸 환영합니다!
            </p>
            <p className='text-md md:text-xl text-gray-700 mt-4'>
              화면 상단에 표시되는 방향과 동일한 방향키(↑, →, ↓, ←)를 눌러
              점수를 올리세요.
              <br />
              잘못 누르면 1초간 입력이 중지됩니다.
            </p>
            <p className='mt-8 text-2xl text-gray-800'>
              {countdown} 초 후 게임 시작
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
