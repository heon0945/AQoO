'use client';

import { useSFX } from '@/hooks/useSFX';
import { getStompClient } from '@/lib/stompclient';
import axiosInstance from '@/services/axiosInstance';
import { User } from '@/store/authAtom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

//
// ----- 타입 선언들 -----
//
interface GameAPlayer {
  userName: string; // 서버에서 내려주는 식별자
  totalPressCount: number; // 실제로는 서버의 score(= 맞춘 횟수)
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

/** 서버가 내려주는 메시지 중 players, finishOrder 등이 들어있는 형태 */
interface RoomResponse {
  roomId: string;
  players: GameAPlayer[];
  message: string; // 'PRESS_UPDATED' | 'GAME_ENDED' | ...
  winner?: string;
  finishOrder?: string[];
  directionSequence?: number[];
}

/** GameA 컴포넌트가 부모로부터 받는 props */
interface GameAProps {
  roomId: string;
  // userName은 사용자 식별 (닉네임)이라 가정
  userName: string;
  // 서버에서 처음에 GAME_A_STARTED로 내려준 플레이어 목록
  initialPlayers: GameAPlayer[];
  // 서버에서 내려준 방향키 시퀀스 (UI 표시용)
  initialDirectionSequence: number[];
  onResultConfirmed: () => void;
  user: User; // 로그인된 사용자 정보 (레벨 등)
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
  }
};

export default function GameA({
  roomId,
  userName,
  initialPlayers,
  initialDirectionSequence,
  onResultConfirmed,
  user,
}: GameAProps) {
  //
  // ----- (1) 기본 상태 ------
  //
  const [prevLevel] = useState<number>(user.level ?? 0);

  // 보상 모달
  const [showExpModal, setShowExpModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  // 티켓, 경험치
  const [myTicket, setMyTicket] = useState<number | null>(null);
  const [myExpInfo, setMyExpInfo] = useState<ExpResponse | null>(null);
  const [myEarnedExp, setMyEarnedExp] = useState<number>(0);

  // 게임 진행
  const [countdown, setCountdown] = useState(3);
  const [hasCountdownFinished, setHasCountdownFinished] = useState(false);
  const [currentPlayers, setCurrentPlayers] =
    useState<GameAPlayer[]>(initialPlayers);

  const directionSequence = initialDirectionSequence;

  // 게임 종료 제어
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [finishOrder, setFinishOrder] = useState<string[]>([]);

  // finishOrder의 닉네임 스냅샷
  const [finishOrderSnapshot, setFinishOrderSnapshot] = useState<string[]>([]);

  const [isStunned, setIsStunned] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [gameTime, setGameTime] = useState(30);
  const [modalDismissed, setModalDismissed] = useState(false);

  // 트랙 크기 측정
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackDims, setTrackDims] = useState({ width: 0, height: 0 });
  const totalLanes = 6;
  const laneAreaFactor = 0.7;
  const laneAreaHeight = trackDims.height * laneAreaFactor;
  const laneAreaTopOffset = (trackDims.height - laneAreaHeight) / 2;
  const laneHeight = laneAreaHeight ? laneAreaHeight / totalLanes : 120;

  // 효과음
  // 짜잔.mp3 = 축하 사운드라면, 혹은 오답 사운드라면 이름을 맞춰 바꿔주세요
  const { play: correctSound } = useSFX('/sounds/clickeffect-03.mp3');
  const { play: errorSound } = useSFX('/sounds/짜잔.mp3');
  const { play: levelUpSound } = useSFX('/sounds/levelupRank.mp3');

  //
  // ----- (2) 트랙 사이즈 측정 -----
  //
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

  //
  // ----- (3) STOMP 메시지 구독 -----
  //     - data.message === 'PRESS_UPDATED' => currentPlayers 갱신
  //     - data.message === 'GAME_ENDED'    => setGameEnded(true) + finishOrder 설정
  //
  useEffect(() => {
    const client = getStompClient();
    if (!client) return;

    const subscription = client.subscribe(
      `/topic/room/${roomId}`,
      (messageFrame) => {
        const data: RoomResponse = JSON.parse(messageFrame.body);
        if (data.message === 'PRESS_UPDATED' && data.players) {
          // 플레이어 목록 갱신
          setCurrentPlayers(data.players);
          // console.log('PRESS_UPDATED received:', data.players);
        } else if (data.message === 'GAME_ENDED') {
          // 게임 종료
          setGameEnded(true);
          setCurrentPlayers(data.players || []);
          setFinishOrder(data.finishOrder || []);
          setWinner(data.winner || null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [roomId]);

  //
  // ----- (4) 카운트다운 -----
  //
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setHasCountdownFinished(true);
  }, [countdown]);

  // 카운트다운 끝나면 서버에 '준비 해제' 메시지 (선택)
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

  //
  // ----- (5) 현재 타겟 방향(로컬 표시용) -----
  //     - 서버도 동일한 로직으로 (score=인덱스) 검사하므로 일관성 있음
  //
  const currentTarget = useMemo(() => {
    const me = currentPlayers.find((p) => p.userName === userName);
    if (!directionSequence || !me) return null;
    const index = me.totalPressCount; // 내가 맞힌 횟수 => 다음에 맞춰야 할 인덱스
    if (directionSequence[index] !== undefined) {
      return directionSequence[index];
    }
    return null;
  }, [directionSequence, currentPlayers, userName]);

  //
  // ----- (6) 방향키 입력 핸들러 -----
  //     - 로컬에서 “오답”이면 1초 스턴 처리, “정답”이면 서버에 메시지
  //     - 실제 판정은 서버가 “PRESS_UPDATED”로 결과 반영
  //
  const handleArrowKey = useCallback(
    (e: KeyboardEvent) => {
      // 게임 끝났거나 카운트다운 전이면 무시
      if (gameEnded || !hasCountdownFinished) return;

      let direction: number | null = null;
      if (e.key === 'ArrowUp') direction = 0;
      if (e.key === 'ArrowRight') direction = 1;
      if (e.key === 'ArrowDown') direction = 2;
      if (e.key === 'ArrowLeft') direction = 3;

      if (direction === null) return;

      // 로컬 stun 체크
      if (isStunned) {
        console.log('Input ignored: stunned');
        return;
      }

      // 첫 입력이면 게임 시작
      if (!hasStarted) {
        setHasStarted(true);
      }

      // 로컬에서 “정답” 판단 (서버도 어차피 재검증)
      if (currentTarget !== null && direction === currentTarget) {
        correctSound();

        // 서버에 입력 전달
        const client = getStompClient();
        if (client && client.connected) {
          client.publish({
            destination: '/app/gameA.press',
            body: JSON.stringify({ roomId, userName, direction }),
          });
        }
      } else {
        // 오답
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

  // 키 이벤트 등록/해제
  useEffect(() => {
    window.addEventListener('keydown', handleArrowKey);
    return () => {
      window.removeEventListener('keydown', handleArrowKey);
    };
  }, [handleArrowKey]);

  //
  // ----- (7) 로컬 게임 타이머 (옵션) -----
  //     - 여기서는 단순히 화면에만 표시
  //     - 시간이 0이 되어도 로컬에서 setGameEnded(true)는 하지 않음
  //       (실제 종료는 서버가 “GAME_ENDED” 브로드캐스트)
  //
  useEffect(() => {
    if (!hasStarted || gameEnded) return;
    const timer = setInterval(() => {
      setGameTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, gameEnded]);

  // 타임아웃 후 서버에 종료 요청을 보낼 수도 있음. (선택)
  useEffect(() => {
    if (gameTime <= 0 && !gameEnded && hasStarted) {
      // 여기서 서버에 “endGame” 요청
      // publishMessage('/app/gameA.end', { roomId });
      // console.log('Time over -> requesting server to end game...');
    }
  }, [gameTime, gameEnded, hasStarted, roomId]);

  //
  // ----- (8) “GAME_ENDED” 이후 finishOrder가 클라이언트에 도착하면 경험치 계산 -----
  //
  useEffect(() => {
    if (!gameEnded || finishOrder.length === 0) return;

    const rank = finishOrder.indexOf(userName) + 1;
    if (rank <= 0) return; // finishOrder에 없는 경우

    // 간단한 규칙
    const earnedExp = rank === 1 ? 20 : rank === 2 ? 10 : rank === 3 ? 5 : 3;
    setMyEarnedExp(earnedExp);

    (async () => {
      try {
        const response = await axiosInstance.post('/users/exp-up', {
          userId: userName,
          earnedExp,
        });
        setMyExpInfo(response.data);
      } catch (err) {
        console.error('경험치 지급 에러:', err);
      }
    })();
  }, [gameEnded, finishOrder, userName]);

  // finishOrderSnapshot = 닉네임 기반
  useEffect(() => {
    if (
      gameEnded &&
      finishOrder.length > 0 &&
      finishOrderSnapshot.length === 0
    ) {
      const snapshot = finishOrder.map((u) => {
        const player = currentPlayers.find((p) => p.userName === u);
        return player ? player.nickname : u;
      });
      setFinishOrderSnapshot(snapshot);
    }
  }, [gameEnded, finishOrder, finishOrderSnapshot, currentPlayers]);

  //
  // ----- (9) 도착 모달 -----
  //
  const me = currentPlayers.find((p) => p.userName === userName);
  const hasArrived = me ? me.totalPressCount >= 100 : false;

  const handleModalClose = () => setModalDismissed(true);
  const handleResultCheck = () => onResultConfirmed();

  //
  // ----- (10) 경험치/레벨업 모달 -----
  //
  useEffect(() => {
    if (myExpInfo) {
      setShowExpModal(true);
      errorSound(); // 짜잔.mp3가 축하 사운드라면 이름만 변경
    }
  }, [myExpInfo, errorSound]);

  const handleExpModalClose = () => {
    setShowExpModal(false);
    if (!myExpInfo) return;
    // 레벨업?
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
          console.error('티켓 증가 에러:', err);
        }
      })();
    }
  };

  const handleLevelUpModalClose = () => {
    setShowLevelUpModal(false);
  };

  //
  // ----- (11) 만약 gameEnded라면 최종 화면 표시 -----
  //
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
          {/* 전체 순위 */}
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

        {/* 경험치 모달 */}
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
                티켓 +3
                {myTicket !== null && (
                  <span className='text-gray-700 ml-1'>
                    (현재 {myTicket}개)
                  </span>
                )}
              </p>
              <button
                onClick={() => {
                  handleLevelUpModalClose();
                }}
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

  //
  // ----- (12) 게임 진행 중 화면 -----
  //
  return (
    <div
      className='w-full h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden'
      style={{ backgroundImage: "url('/chat_images/game_bg.gif')" }}
      ref={trackRef}
    >
      {/* 결승 모달 (내가 이미 100점에 도달했지만 게임 자체는 안 끝난 상태) */}
      {!gameEnded && hasArrived && !modalDismissed && (
        <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30'>
          <div className='bg-white p-8 rounded-lg shadow-lg text-center'>
            <h2 className='text-2xl font-bold mb-4'>결승점 도착!</h2>
            <p className='text-xl mb-4'>
              다른 플레이어들이 도착할 때까지 기다려주세요!
            </p>
            <button
              onClick={handleModalClose}
              className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded'
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 트랙 선 (Start / Goal) */}
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

          {/* Lane 구분선 */}
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

        // 아직 시작 전일 때, 내 캐릭터는 start 라인에 위치
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

      {/* 화면 상단: 현재 요구되는 방향 & 타이머 표시 */}
      {hasCountdownFinished && !gameEnded && (
        <div className='absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/80 px-4 py-2 rounded text-xl text-gray-800'>
          {currentTarget !== null && (
            <>
              <span>현재 방향:</span>
              <span className='text-2xl font-bold'>
                {getArrowIcon(currentTarget)}
              </span>
            </>
          )}
          <div className='ml-4'>Time: {gameTime}</div>
        </div>
      )}

      {/* 디버그 정보 */}
      <div className='absolute bottom-4 left-4 bg-white/80 p-2 rounded text-sm z-50'>
        <pre>
          {JSON.stringify(
            {
              hasCountdownFinished,
              hasStarted,
              gameEnded,
              currentTarget,
              currentPlayers,
              initialPlayers,
            },
            null,
            2
          )}
        </pre>
      </div>

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
