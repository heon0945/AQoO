"use client";

import { HAND_CONNECTIONS, Hands } from "@mediapipe/hands"; // 손 인식을 위한 라이브러리
import { HelpCircle, X } from "lucide-react";
import axios, { AxiosResponse } from "axios";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils"; // 손 랜드마크 그리기 라이브러리
import { useEffect, useRef, useState } from "react";

import { Camera } from "@mediapipe/camera_utils"; // 카메라 사용 라이브러리
import axiosInstance from "@/services/axiosInstance";
import { useAuth } from "@/hooks/useAuth"; // ✅ 로그인 정보 가져오기
import { useSFX } from "@/hooks/useSFX";
import { useToast } from "@/hooks/useToast";

interface InteractionComponentProps {
  onClose: () => void;
  onSuccess: () => void;
  handleIncreaseExp: (earnedExp: number) => Promise<void>;
  aquariumId: number;
  type: "clean" | "feed";
}

export default function InteractionComponent({
  onClose,
  onSuccess,
  handleIncreaseExp,
  aquariumId,
  type,
}: InteractionComponentProps) {
  const { auth } = useAuth(); // ✅ 로그인한 유저 정보 가져오기

  const { play: playClean } = useSFX("/sounds/창문닦기.mp3");
  const { play: playFeed } = useSFX("/sounds/feedEffect.mp3");
  const { play: playClear } = useSFX("/sounds/성공알림-01.mp3");
  const { showToast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [error, setError] = useState<string | null>(null); // 오류 메시지 저장
  // 현재 선택된 제스처(손 흔들기 / 주먹 쥐기)
  // const [selectedGesture, setSelectedGesture] = useState<"handMotion" | "rockGesture" | null>(null);

  const [isCameraReady, setIsCameraReady] = useState(false); // 📌 카메라 준비 상태 추가
  const [isMirrored, setIsMirrored] = useState<boolean>(true); // 좌우 반전 여부
  const selectedGestureRef = useRef<"handMotion" | "rockGesture" | null>(null); // 현재 선택된 제스처의 참조 처리

  const [palmImage, setPalmImage] = useState<HTMLImageElement | null>(null); // 손에 물걸레 png
  const [feedImage, setFeedImage] = useState<HTMLImageElement | null>(null); // ✅ 추가

  const startCameraAndHandRecognition = async () => {
    if (!videoRef.current) {
      console.error("🚨 videoRef가 초기화되지 않았습니다.");
      return;
    }
    if (!canvasRef.current) {
      console.error("🚨 canvasRef가 초기화되지 않았습니다.");
      return;
    }
  };

  const gestureState = useRef<{ isRockDetected: boolean; lastGestureTime: number }>({
    isRockDetected: false,
    lastGestureTime: 0,
  });

  // 청소 왔다갔다 횟수
  const count = useRef<number>(0);
  const [motionCount, setMotionCount] = useState<number>(0);

  // 손이 좌우로 움직였는지 추적
  const motionData = useRef<{ startX: number | null; movedLeft: boolean; movedRight: boolean }>({
    // 손의 초기 위치 저장
    startX: null,
    // 좌우로 움직임 여부 저장
    movedLeft: false,
    movedRight: false,
  });

  useEffect(() => {
    const cleanImg = new Image();
    cleanImg.src = "/icon/cleanIcon.png";
    cleanImg.onload = () => setPalmImage(cleanImg);
    cleanImg.onerror = () => console.error("손바닥 이미지 로드 실패");

    const feedImg = new Image();
    feedImg.src = "/icon/feedIcon.png"; // ✅ feedIcon 로드
    feedImg.onload = () => setFeedImage(feedImg);
    feedImg.onerror = () => console.error("먹이 이미지 로드 실패");
  }, []);

  useEffect(() => {
    let hands: Hands | null = null;
    let camera: Camera | null = null;
    let isMounted = true; // unmount 체크용 플래그

    const startCameraAndHandRecognition = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;

        videoElement.onloadedmetadata = () => {
          videoElement.play();
          canvasElement.width = 280;
          canvasElement.height = 200;

          hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
          });

          hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
          });

          hands.onResults((results) => {
            if (!isMounted || !canvasCtx) return; // ✅ 컴포넌트가 언마운트되었으면 실행하지 않음
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            // 미러모드 적용
            if (isMirrored) {
              canvasCtx.save();
              canvasCtx.translate(canvasElement.width, 0);
              canvasCtx.scale(-1, 1);
            }

            // 웹캠 영상 그리기
            if (results.image) {
              canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
            }

            let detectedLandmarks: any = null;

            // canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            if (results.multiHandLandmarks) {
              for (const landmarks of results.multiHandLandmarks) {
                if (type === "clean") {
                  detectHandMotion(landmarks);
                } else if (type === "feed") {
                  detectRockGesture(landmarks);
                }

                // 랜드마크에 선 추가
                // drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                //   color: "#00FF00",
                //   lineWidth: 2,
                // });
                // drawLandmarks(canvasCtx, landmarks, {
                //   color: "#FF0000",
                //   lineWidth: 0.5,
                // });

                // 🏷️ 주요 랜드마크에 캡션 추가
                // labelLandmarks(canvasCtx, landmarks);

                detectedLandmarks = landmarks; // ✅ 마지막으로 감지된 손 정보를 저장
              }
            }

            if (detectedLandmarks) {
              drawPalmOverlay(
                canvasCtx,
                canvasElement,
                detectedLandmarks,
                type === "clean" ? palmImage : feedImage // ✅ clean이면 palmImage, feed면 feedImage 사용
              );
            }

            if (isMirrored) {
              canvasCtx.restore();
            }
          });

          camera = new Camera(videoElement, {
            onFrame: async () => {
              if (!isMounted) return;
              if (!hands) return;
              await hands.send({ image: videoElement });
            },
          });

          camera.start().then(() => {
            setIsCameraReady(true); // 📌 카메라가 준비되면 로딩 해제
          });
        };
      } catch (err) {
        setIsAlternativeMode(true);
        setError("손 인식을 초기화하는 중 문제가 발생했습니다.");
        console.error("Error initializing hand recognition:", err);
      }
    };

    startCameraAndHandRecognition();

    return () => {
      isMounted = false;
      if (camera) {
        camera.stop();
        camera = null;
      }
      if (hands) {
        hands.close();
        hands = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null; // ✅ 비디오 스트림 해제
      }
    };
  }, [isMirrored, palmImage]);

  function detectHandMotion(landmarks: any) {
    const wrist = landmarks[0];
    const currentX = wrist.x;

    const sensitivity = 0.1;
    const now = Date.now();
    if (motionData.current.startX === null) {
      motionData.current.startX = currentX;
      return; // 초기값 설정 후 바로 리턴
    }

    const deltaX = currentX - motionData.current.startX;

    if (deltaX > sensitivity && !motionData.current.movedRight) {
      motionData.current.movedRight = true;
      motionData.current.startX = currentX;
    }
    if (deltaX < -sensitivity && !motionData.current.movedLeft) {
      motionData.current.movedLeft = true;
      motionData.current.startX = currentX;
    }

    if (motionData.current.movedLeft && motionData.current.movedRight) {
      playClean();
      count.current += 1;
      setMotionCount(count.current);

      motionData.current = {
        startX: currentX,
        movedLeft: false,
        movedRight: false,
      };
    }

    if (count.current === 3) {
      motionData.current = { startX: null, movedLeft: false, movedRight: false };
      handleSuccess();
      count.current = 0; // ✅ 카운트 초기화
    }
  }
  const drawPalmOverlay = (
    canvasCtx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    landmarks: { x: number; y: number }[],
    image: HTMLImageElement | null
  ) => {
    if (!image) return;

    let minX = 1,
      maxX = 0,
      minY = 1,
      maxY = 0;

    for (const { x, y } of landmarks) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const pxCenterX = ((minX + maxX) / 2) * canvas.width;
    const pxCenterY = ((minY + maxY) / 2) * canvas.height;
    const PalmSize = Math.max(maxX - minX, maxY - minY) * Math.max(canvas.width, canvas.height);

    const aspect = image.width / image.height;
    let drawW = PalmSize,
      drawH = PalmSize / aspect;
    if (aspect < 1) {
      drawH = PalmSize;
      drawW = PalmSize * aspect;
    }

    canvasCtx.drawImage(image, pxCenterX - drawW / 2, pxCenterY - drawH / 2, drawW, drawH);
  };

  function drawImageAtPoint(
    canvasCtx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    normX: number,
    normY: number,
    image: HTMLImageElement
  ) {
    const pxX = normX * canvas.width;
    const pxY = normY * canvas.height;
    const size = 50;
    canvasCtx.drawImage(image, pxX - size / 2, pxY - size / 2, size, size);
    // canvasCtx.fillRect(pxY - 15, pxX - 15, 30, 30);
  }

  const detectRockGesture = (landmarks: any) => {
    console.log("주먹 감지 중");
    const now = Date.now();
    if (now - gestureState.current.lastGestureTime < 1000) return;

    const [wrist, indexTip, middleTip, ringTip, pinkyTip] = [
      landmarks[0],
      landmarks[8],
      landmarks[12],
      landmarks[16],
      landmarks[20],
    ];

    const isHandClosed =
      indexTip.y > landmarks[6].y &&
      middleTip.y > landmarks[10].y &&
      ringTip.y > landmarks[14].y &&
      pinkyTip.y > landmarks[18].y;

    // ✅ 주먹이 풀렸다면 다시 감지 가능하도록 설정
    if (gestureState.current.isRockDetected) {
      if (!isHandClosed) {
        gestureState.current.isRockDetected = false;
      }
      return;
    }

    if (isHandClosed) {
      gestureState.current.isRockDetected = true;
      gestureState.current.lastGestureTime = now;

      // ✅ 카운트 증가
      count.current += 1;
      playFeed();
      setMotionCount(count.current);

      console.log(`주먹 감지 횟수: ${count.current}`);

      // ✅ 5번 감지되면 handleSuccess 실행
      if (count.current === 5) {
        handleSuccess();
        count.current = 0; // ✅ 카운트 초기화
      }
    }
  };

  async function handleSuccess() {
    try {
      // ✅ 1. API 호출 (청소 or 먹이 주기)
      await axiosInstance.post(`/aquariums/update`, {
        aquariumId: aquariumId,
        type: type, // ✅ "clean" 또는 "feed" 전달
        data: "",
      });

      setMotionCount(0);

      // ✅ 2. 경험치 증가 (feed는 10, clean은 20)
      await handleIncreaseExp(type === "clean" ? 20 : 20);

      // ✅ 3. 성공 토스트 메시지
      showToast(type === "clean" ? "청소에 성공했어요! 🐟" : "먹이를 줬어요! 🍽", "success");

      // ✅ 4. 성공 효과음 재생
      playClear();

      // ✅ 5. 어항 상태 업데이트
      onSuccess();

      // ✅ 6. 모달 닫기
      onClose();
    } catch (error) {
      console.error("❌ 업데이트 실패", error);
    }
  }

  async function handleCleanSuccess() {
    try {
      // ✅ 1. 어항 청소 API 호출
      await axiosInstance.post(`/aquariums/update`, {
        aquariumId: aquariumId,
        type: "clean",
        data: "",
      });

      setMotionCount(0);
      // ✅ 2. 경험치 10 증가 및 레벨업 감지
      await handleIncreaseExp(20);

      // ✅ 3. 어항 상태 & 유저 정보 업데이트 요청
      onSuccess();

      // ✅ 4. 모달 닫기
      onClose();
    } catch (error) {
      console.error("❌ 청소 또는 경험치 지급 실패", error);
    }
  }

  const labelLandmarks = (canvasCtx: CanvasRenderingContext2D, landmarks: any) => {
    canvasCtx.fillStyle = "yellow"; // 캡션 색상
    canvasCtx.font = "14px Arial"; // 캡션 폰트

    const names = ["Wrist", "Thumb Tip", "Index Tip", "Middle Tip", "Ring Tip", "Pinky Tip"];

    const indices = [0, 4, 8, 12, 16, 20];

    for (let i = 0; i < names.length; i++) {
      const index = indices[i];
      const landmark = landmarks[index];

      // 🌟 캡션을 약간 위쪽으로 이동하여 손가락과 겹치지 않도록 함
      canvasCtx.fillText(names[i], landmark.x * canvasRef.current!.width, landmark.y * canvasRef.current!.height - 10);
    }
  };

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAlternativeMode, setIsAlternativeMode] = useState(false);

  return (
    <div className="relative w-auto h-auto bg-white bg-opacity-70 border border-black rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{type === "clean" ? "어항 청소하기" : "먹이 주기"}</h2>
        <div className="flex space-x-2">
          <button onClick={() => setIsGuideOpen(true)} className="text-xl font-bold hover:text-blue-500">
            <HelpCircle className="w-6 h-6 text-fwhite" />
          </button>
          <button onClick={onClose} className="text-xl font-bold hover:text-red-500">
            <X className="w-6 h-6 text-fwhite" />
          </button>
        </div>
      </div>

      {!isAlternativeMode ? (
        <div className="space-y-3">
          <div className="w-[300px] h-[200px] relative">
            {!isCameraReady && (
              <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center">
                <span className="text-gray-500 text-sm">카메라 준비 중...</span>
              </div>
            )}
            <div className="absolute top-2 right-2 px-2 py-1 bg-black text-white rounded-md font-bold z-10">
              {motionCount}
            </div>
            <video
              ref={videoRef}
              className="absolute w-[300px] h-[200px]"
              style={{ display: "none" }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="absolute w-[300px] h-[200px]" />
          </div>

          <div>
            <p className="mt-5 text-sm text-center whitespace-pre-line">
              {type === "clean"
                ? "어항이 깨끗해질 수 있게 좌우로 닦아주세요! \n손바닥을 펴서 왼쪽부터 오른쪽 끝까지!"
                : "물고기에게 먹이를 주세요! \n 카메라를 향해 주먹을 다섯 번 쥐었다 펴보세요!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <p>
            카메라를 사용할 수 없습니다. <br />
            대신 아래 버튼을 눌러 청소하세요!
          </p>
          <button
            onClick={handleCleanSuccess}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            {type === "clean" ? "청소 완료하기" : "먹이 주기 완료하기"}
          </button>
        </div>
      )}

      {isGuideOpen && (
        <div className="absolute top-0 left-0 z-10 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold">청소 방법 안내</h3>
            <div className="border mt-2 p-2 border-black rounded-sm">
              <p className="mt-2 whitespace-pre-line">
                {type === "clean"
                  ? "손을 왼쪽 끝부터 오른쪽 끝까지 \n천천히 움직여 보세요! \n우측 상단 카운트가 올라가요!"
                  : "주먹을 쥐었다 펴보세요! \n다섯 번 감지되면 \n먹이 주기가 완료됩니다!"}
              </p>
            </div>
            <p className="mt-2">
              카메라 사용이 불가능한 경우,
              <br />
              버튼으로 {type === "clean" ? "청소해주세요!" : "먹이를 주세요!"}
            </p>
            <button
              onClick={() => {
                showToast(type === "clean" ? "청소에 성공했어요! 🐟" : "먹이를 줬어요! 🍽", "success");
                playClear();
                count.current = 0;
                handleCleanSuccess();
                setIsGuideOpen(false);
              }}
              className="mt-4 px-4 py-2 bg-green-500 mr-2 text-white font-bold rounded-lg hover:bg-red-700"
            >
              {type === "clean" ? "청소하기" : "먹이 주기"}
            </button>
            <button
              onClick={() => setIsGuideOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-red-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
