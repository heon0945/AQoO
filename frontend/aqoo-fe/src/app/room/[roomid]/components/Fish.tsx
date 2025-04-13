"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useSFX } from "@/hooks/useSFX"; // 사운드 효과 훅 (필요 없으면 제거)

interface FishData {
  fishId: number;
  fishName: string;
  fishImage: string;
  userName: string;
}

interface FishProps {
  fish: FishData;
  message?: string;
}

export default function Fish({ fish, message }: FishProps) {
  const fishRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 말풍선 표시 여부/메시지
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);

  // 말풍선 위치 추적용
  const [fishPosition, setFishPosition] = useState({ x: 0, y: 0 });

  // 이동 방향(이미지 좌우 반전)에 쓰일 ref
  const directionRef = useRef(1);

  // 사운드 훅 (원치 않을 시 삭제 및 onClick에서 play() 제거)
  const { play } = useSFX("/sounds/pop-02.mp3");

  // 들어온 message가 있으면 2초 뒤에 말풍선 숨김
  useEffect(() => {
    if (message && message.trim() !== "") {
      setShowMessage(true);
      setCurrentMessage(message);

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setShowMessage(false);
        setCurrentMessage(null);
        timerRef.current = null;
      }, 2000);
    }
  }, [message]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 물고기 위치를 추적하여 말풍선 div가 따라갈 수 있게 함
  useEffect(() => {
    const updatePosition = () => {
      if (!fishRef.current) return;
      const rect = fishRef.current.getBoundingClientRect();
      setFishPosition({ x: rect.left, y: rect.top });
    };

    const interval = setInterval(updatePosition, 50);
    return () => clearInterval(interval);
  }, []);

  // 물고기 랜덤 이동 애니메이션
  useEffect(() => {
    if (!fishRef.current || !containerRef.current) return;

    const fishEl = fishRef.current;
    const containerEl = containerRef.current;
    const containerWidth = containerEl.offsetWidth;
    const containerHeight = containerEl.offsetHeight;

    // 최초 위치 설정
    const initialX = Math.random() * (containerWidth - 100);
    const initialY = Math.random() * (containerHeight - 100);
    gsap.set(fishEl, { x: initialX, y: initialY, scaleX: -1 }); // -1이면 오른쪽 바라봄

    const moveFish = () => {
      if (!fishEl) return;

      // 이동 속도, 이동 거리
      const randomSpeed = Math.random() * 7 + 9; // 9 ~ 16
      const maxMoveX = containerWidth * (0.4 + Math.random() * 0.4); 
      let moveDistanceX = maxMoveX * (Math.random() > 0.5 ? 1 : -1);

      const currentY = parseFloat(gsap.getProperty(fishEl, "y") as string);
      let moveDistanceY = containerHeight * (0.1 + Math.random() * 0.15) * (Math.random() > 0.65 ? 1 : -1);

      // 너무 위쪽으로 가면 아래로 내려오도록
      const upperLimit = containerHeight * 0.2;
      if (currentY < upperLimit) {
        moveDistanceY = containerHeight * (0.1 + Math.random() * 0.2);
      }

      let newX = parseFloat(gsap.getProperty(fishEl, "x") as string) + moveDistanceX;
      let newY = currentY + moveDistanceY;

      // 경계값
      const fishWidth = 100;
      const fishHeight = 100;
      const safeMargin = 0;
      const bottomMargin = 50;

      // 좌우 경계
      if (newX < safeMargin) {
        newX = safeMargin;
        moveDistanceX = Math.abs(moveDistanceX);
      }
      if (newX > containerWidth - safeMargin - fishWidth) {
        newX = containerWidth - safeMargin - fishWidth;
        moveDistanceX = -Math.abs(moveDistanceX);
      }
      // 상하 경계
      if (newY < 50) {
        newY = 50 + Math.random() * 30;
      }
      if (newY > containerHeight - bottomMargin) {
        newY = containerHeight - bottomMargin - Math.random() * 30;
      }

      // 이동 방향에 따라 좌우 반전
      directionRef.current = moveDistanceX > 0 ? -1 : 1;

      gsap.to(fishEl, {
        x: newX,
        y: newY,
        scaleX: directionRef.current,
        duration: randomSpeed,
        ease: "power2.inOut",
        onUpdate: () => {
          // 중간에 방향 다시 바뀌면 scaleX 갱신
          if (fishEl) {
            const prevX = parseFloat(gsap.getProperty(fishEl, "x") as string);
            directionRef.current = newX > prevX ? -1 : 1;
            gsap.set(fishEl, { scaleX: directionRef.current });
          }
        },
        onComplete: moveFish,
      });
    };

    moveFish();

    // 언마운트 시 gsap 애니메이션 제거
    return () => {
      if (fishEl) {
        gsap.killTweensOf(fishEl);
      }
    };
  }, []);

  // 클릭 시 (사운드, 스케일 바운스)
  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!fishRef.current) return;

    // 사운드
    play();

    // 스케일 바운스
    gsap.to(fishRef.current, {
      scale: 0.9,
      duration: 0.15,
      ease: "power1.inOut",
      yoyo: true,
      repeat: 1,
    });

    // 만약 경험치 텍스트처럼 화면에 +1 메시지 띄우려면 이런 식으로:
    // createExpEffect(e.clientX, e.clientY); 
  };

  // (선택) +1 EXP 효과 예시: 필요 없으면 지우세요
  const createExpEffect = (x: number, y: number) => {
    const expDiv = document.createElement("div");
    expDiv.innerText = "+1 EXP";
    expDiv.style.position = "absolute";
    expDiv.style.left = `${x}px`;
    expDiv.style.top = `${y}px`;
    expDiv.style.fontSize = "16px";
    expDiv.style.fontWeight = "bold";
    expDiv.style.color = "#FFD700";
    expDiv.style.pointerEvents = "none";
    document.body.appendChild(expDiv);

    gsap.to(expDiv, {
      y: -30,
      opacity: 0,
      duration: 1.2,
      ease: "power1.out",
      onComplete: () => {
        document.body.removeChild(expDiv);
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className="absolute w-[1265px] h-[650px] top-[20px] left-[20px] border border-transparent"
      style={{ pointerEvents: "none" }}
    >
      {/* 말풍선 (message) */}
      {showMessage && currentMessage && (
        <div
          className="absolute bg-white px-3 py-1 rounded-lg shadow-md text-sm text-gray-900 border border-gray-400"
          style={{
            top: fishPosition.y - 30,
            left: fishPosition.x + 25,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          {currentMessage}
        </div>
      )}

      <div>
        <img
          ref={fishRef}
          onClick={handleClick}
          src={fish.fishImage}
          alt={fish.fishName}
          width={100}
          height={100}
          className="relative"
          style={{
            pointerEvents: "auto",
            zIndex: 9999,
          }}
        />
        {/* 물고기 이름 표시 */}
        <div
          className="absolute text-xl font-medium text-gray-900 px-2 py-1 rounded-md"
          style={{
            top: fishPosition.y + 50,
            left: fishPosition.x + 25,
            transform: "translate(-50%, 0%)",
            zIndex: 9999,
            whiteSpace: "nowrap",
          }}
        >
          {fish.fishName}
        </div>
      </div>
    </div>
  );
}
