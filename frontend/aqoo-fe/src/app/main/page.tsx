"use client";

import { AquariumData, UserInfo } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";

import BottomMenuBar from "@/app/main/BottomMenuBar";
import CleanComponent from "@/app/main/CleanComponent";
import FriendsList from "@/app/main/FriendsList";
import Link from "next/link";
import PushNotifications from "@/app/main/PushNotifications";
import { Settings } from "lucide-react";
import { gsap } from "gsap";

// 🔹 물고기 데이터 타입 정의
interface FishData {
  id: number;
  name: string;
  image: string; // 물고기 이미지 URL
}

export default function MainPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [background, setBackground] = useState("/background-1.png");
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [fishes, setFishes] = useState<FishData[]>([]);
  const [aquariumData, setAquariumData] = useState<AquariumData | null>(null);

  const API_BASE_URL = "http://i12e203.p.ssafy.io:8089/api/v1";
  const userId = "ejoyee"; // dummy

  useEffect(() => {
    const savedBg = localStorage.getItem("background");
    if (savedBg) {
      setBackground(savedBg);
    }

    axios
      .get(`${API_BASE_URL}/users/${userId}`)
      .then((response: AxiosResponse<UserInfo>) => {
        console.log(response.data);
        setUserInfo(response.data);
      })
      .catch((error) => {
        console.error("유저 정보 불러오기 실패", error);
      });
  }, []);

  useEffect(() => {
    if (userInfo?.mainAquarium !== null && userInfo?.mainAquarium !== undefined) {
      console.log("메인 아쿠아리움 id:", userInfo.mainAquarium);

      axios
        .get(`${API_BASE_URL}/aquariums/${userInfo.mainAquarium}`)
        .then((res: AxiosResponse<AquariumData>) => {
          console.log("어항 상세 정보 조회", res.data);
          setAquariumData(res.data);
        })
        .catch((err) => console.error("어항 정보 불러오기 실패", err));
    }
  }, [userInfo]); // ✅ `userInfo`가 변경될 때 실행

  useEffect(() => {
    // ✅ API 대신 테스트용 더미 데이터 사용
    const dummyFishData: FishData[] = [
      { id: 1, name: "물고기1", image: "/fish-1.png" },
      { id: 2, name: "물고기2", image: "/fish-2.png" },
      { id: 3, name: "물고기3", image: "/fish-3.png" },
      { id: 4, name: "물고기4", image: "/fish-4.png" },
      { id: 5, name: "물고기5", image: "/fish-5.png" },
    ];
    setFishes(dummyFishData);
  }, []);

  if (!userInfo) return <div>로딩 중...</div>;
  else if (!aquariumData) return <div>아쿠아리움 정보 로딩중...</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <title>AQoO</title>
      {/* 🖼 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center w-screen h-screen before:absolute before:inset-0 before:bg-white/30"
        style={{ backgroundImage: `url(${background})` }}
      ></div>

      {/* 🐠 떠다니는 물고기 렌더링 */}
      {fishes.map((fish) => (
        <Fish key={fish.id} fish={fish} />
      ))}

      {/* 🏠 상단 네비게이션 */}
      {/* <div className="absolute top-4 left-4 z-10 mt-2 ml-10">
        <Link href="/">
          <span className="text-white text-5xl hover:text-yellow-300">AQoO</span>
        </Link>
      </div>
      <button
        className="absolute top-4 right-4 p-2 mt-2 mr-10 bg-white/30 rounded-full hover:bg-white/50 z-10"
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
      >
        <Settings className="w-6 h-6 text-white" />
      </button> */}

      {/* 📌 하단 메뉴 바 */}
      <BottomMenuBar setActiveComponent={setActiveComponent} userInfo={userInfo} aquariumData={aquariumData} />

      {/* ✅ CleanComponent를 BottomMenuBar 위에 정확하게 배치 */}
      {activeComponent === "clean" && (
        <div className="absolute bottom-[130px] right-[100px] z-50">
          <CleanComponent onClose={() => setActiveComponent(null)} />
        </div>
      )}

      {/* ✅ FriendsList도 같은 방식 적용 */}
      {activeComponent === "friends" && (
        <div className="absolute bottom-[130px] left-[100px] z-50">
          <FriendsList onClose={() => setActiveComponent(null)} userId={userInfo.id} />
        </div>
      )}

      {/* ✅ PushNotifications도 같은 방식 적용 */}
      {activeComponent === "push" && (
        <div className="absolute bottom-[130px] left-[100px] z-50">
          <PushNotifications onClose={() => setActiveComponent(null)} />
        </div>
      )}
    </div>
  );
}
function Fish({ fish }: { fish: FishData }) {
  const fishRef = useRef<HTMLImageElement | null>(null);
  const directionRef = useRef(-1); // 기본 방향: 왼쪽 (-1)

  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (!fishRef.current) return;

    gsap.to(fishRef.current, {
      scale: 0.9,
      duration: 0.15,
      ease: "power1.inOut",
      yoyo: true,
      repeat: 1,
    });
  };

  useEffect(() => {
    if (!fishRef.current) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const safeMargin = 80;
    const bottomMargin = 100;
    const upperLimit = windowHeight * 0.2; // 화면 상단 20% 이내에서는 내려가는 확률 높이기

    const randomStartX = Math.random() * (windowWidth - 2 * safeMargin) + safeMargin;
    const randomStartY = Math.random() * (windowHeight - bottomMargin - 50) + 50;

    // 물고기 초기 위치 설정 (기본 왼쪽 방향)
    gsap.set(fishRef.current, {
      x: randomStartX,
      y: randomStartY,
      scaleX: directionRef.current, // 기본적으로 왼쪽 (-1)
    });

    const moveFish = () => {
      if (!fishRef.current) return;

      const randomSpeed = Math.random() * 7 + 9; // 속도 랜덤
      const maxMoveX = windowWidth * (0.4 + Math.random() * 0.4);
      // eslint-disable-next-line prefer-const
      let moveDistanceX = maxMoveX * (Math.random() > 0.5 ? 1 : -1);

      const currentY = parseFloat(gsap.getProperty(fishRef.current, "y") as string);

      // 🔹 아래로 이동하는 비율 높이기
      let moveDistanceY = windowHeight * (0.1 + Math.random() * 0.15) * (Math.random() > 0.65 ? 1 : -1);

      // 🔹 화면 상단 20% 이상일 경우, 아래로 이동하는 확률을 80% 이상으로 증가
      if (currentY < upperLimit) {
        moveDistanceY = windowHeight * (0.1 + Math.random() * 0.2);
      }

      // 새로운 위치 계산
      let newX = parseFloat(gsap.getProperty(fishRef.current, "x") as string) + moveDistanceX;
      let newY = currentY + moveDistanceY;

      // 경계 제한
      if (newX < safeMargin) {
        newX = safeMargin + Math.random() * 50;
        directionRef.current = -1;
      }
      if (newX > windowWidth - safeMargin) {
        newX = windowWidth - safeMargin - Math.random() * 50;
        directionRef.current = 1;
      }
      if (newY < 50) newY = 50 + Math.random() * 30;
      if (newY > windowHeight - bottomMargin) newY = windowHeight - bottomMargin - Math.random() * 30;

      // 애니메이션 적용
      gsap.to(fishRef.current, {
        x: newX,
        y: newY,
        duration: randomSpeed,
        ease: "power2.inOut",
        onUpdate: () => {
          const prevX = parseFloat(gsap.getProperty(fishRef.current, "x") as string);
          directionRef.current = newX > prevX ? 1 : -1;
          gsap.set(fishRef.current, { scaleX: directionRef.current });
        },
        onComplete: moveFish, // 계속 이동 반복
      });
    };

    moveFish();
  }, []);

  return (
    <img
      ref={fishRef}
      src={fish.image}
      alt={fish.name}
      className="absolute max-w-64 h-16 transform-gpu"
      style={{
        transformOrigin: "center",
        transform: "translate(-50%, -50%)",
      }}
      onClick={handleClick}
    />
  );
}
