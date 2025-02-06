"use client";

import { HAND_CONNECTIONS, Hands } from "@mediapipe/hands"; // 손 인식을 위한 라이브러리
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils"; // 손 랜드마크 그리기 라이브러리
import { useEffect, useRef, useState } from "react";

import { Camera } from "@mediapipe/camera_utils"; // 카메라 사용 라이브러리

export default function CleanComponent({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 오류 메시지 저장
  const [error, setError] = useState<string | null>(null);
  // 현재 선택된 제스처(손 흔들기 / 주먹 쥐기)
  const [selectedGesture, setSelectedGesture] = useState<"handMotion" | "rockGesture" | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false); // 📌 카메라 준비 상태 추가

  // 좌우 반전 여부
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  // 현재 선택된 제스처의 참조 처리
  const selectedGestureRef = useRef<"handMotion" | "rockGesture" | null>(null); // 🔥 추가

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

  const gestureState = useRef<{
    // 주먹을 감지했는지 여부
    isRockDetected: boolean;
    // 최근 제스처 감지 시간 기록(중복 방지)
    lastGestureTime: number;
  }>({
    isRockDetected: false,
    lastGestureTime: 0,
  });

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
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          hands.onResults((results) => {
            if (!isMounted || !canvasCtx) return; // ✅ 컴포넌트가 언마운트되었으면 실행하지 않음
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            if (isMirrored) {
              canvasCtx.save();
              canvasCtx.translate(canvasElement.width, 0);
              canvasCtx.scale(-1, 1);
            }

            if (results.image) {
              canvasCtx.drawImage(results.image, 0, 0, 280, 200);
            }

            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            if (results.multiHandLandmarks) {
              for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                  color: "#00FF00",
                  lineWidth: 2,
                });
                drawLandmarks(canvasCtx, landmarks, {
                  color: "#FF0000",
                  lineWidth: 0.5,
                });

                // 🏷️ 주요 랜드마크에 캡션 추가
                // labelLandmarks(canvasCtx, landmarks);

                // // 🔥 선택한 제스처만 감지 실행
                // if (selectedGestureRef.current === "handMotion") {
                //   detectHandMotion(landmarks);
                // } else if (selectedGestureRef.current === "rockGesture") {
                //   detectRockGesture(landmarks);
                // }
              }
            }

            if (isMirrored) {
              canvasCtx.restore();
            }
          });

          camera = new Camera(videoElement, {
            onFrame: async () => {
              if (hands) await hands.send({ image: videoElement });
            },
          });

          camera.start().then(() => {
            setIsCameraReady(true); // 📌 카메라가 준비되면 로딩 해제
          });
        };
      } catch (err) {
        setError("손 인식을 초기화하는 중 문제가 발생했습니다.");
        console.error("Error initializing hand recognition:", err);
      }
    };

    startCameraAndHandRecognition();

    return () => {
      isMounted = false; // ✅ Cleanup 전역 변수 설정

      if (hands) {
        hands.close();
        hands = null;
      }

      if (camera) {
        camera.stop();
        camera = null;
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMirrored]);

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

  return (
    <div className="relative w-auto h-auto bg-white bg-opacity-70 border border-black rounded-lg shadow-lg rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">어항 청소하기</h2>
        <button onClick={onClose} className="text-xl font-bold hover:text-red-500">
          ✖
        </button>
      </div>
      <div className="space-y-3">
        <div className="w-[300px] h-[200px]">
          {/* 📌 로딩 중일 때 스켈레톤 UI 표시 */}
          {!isCameraReady && (
            <div className="absolute inset-0 bg-gray-300 animate-pulse rounded-md flex items-center justify-center">
              <span className="text-gray-500 text-sm">카메라 준비 중...</span>
            </div>
          )}
          <video
            ref={videoRef}
            className="absolute w-[300px] h-[200px]"
            style={{ display: "none" }}
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="absolute w-[300px] h-[200px]" />
        </div>
      </div>
      <div>
        <p className="mt-5 text-sm text-center">
          어항이 깨끗해질 수 있게 박박 닦아주세요! <br />
          카메라를 향해 손바닥을 펴서 흔들어주세요!
        </p>
      </div>
    </div>
  );
}
