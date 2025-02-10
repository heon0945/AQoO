// 파일: app/user/find-password/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import InputField from "@/app/user/find-password/components/InputField";
import axios from "axios";

interface RequestFormInputs {
  userId: string;
  email: string;
}

interface VerifyFormInputs {
  authCode: string;
}

export default function FindPasswordPage() {
  const router = useRouter();
  // API 기본 URL
  const API_BASE_URL = "https://i12e203.p.ssafy.io/api/v1";

  // 초기(아이디, 이메일) 입력용 폼
  const { register, handleSubmit, formState: { errors } } = useForm<RequestFormInputs>();

  // 인증번호 입력용 폼 (setError 추가)
  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: errorsVerify },
    setError: setVerifyError
  } = useForm<VerifyFormInputs>();

  // 단계 상태: "request" = 인증번호 전송 전, "verify" = 인증번호 입력 단계
  const [step, setStep] = useState<"request" | "verify">("request");

  // 3분(180초) 타이머 상태
  const [timer, setTimer] = useState<number>(180);

  // 인증번호 전송 시 입력한 userId 저장 (비밀번호 재설정 시 사용)
  const [userId, setUserId] = useState<string>("");

  // 로딩 상태 관리 (각각 전송/확인)
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // 타이머 카운트다운 효과 (인증번호 입력 단계일 때)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verify" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // [1] 인증번호 전송 폼 제출
  const onSubmitRequest: SubmitHandler<RequestFormInputs> = async (data) => {
    setIsSending(true);
    console.log("인증번호 요청 데이터:", data);
    try {
      // POST /email/send 요청
      const response = await axios.post(`${API_BASE_URL}/email/send`, {
        userId: data.userId,
        email: data.email,
      });
      console.log("인증번호 전송 성공:", response.data);
      setUserId(data.userId);
      setStep("verify");
      setTimer(180);
    } catch (error) {
      console.error("인증번호 전송 실패", error);
      // 추가 에러 처리 가능
    } finally {
      setIsSending(false);
    }
  };

  // [2] 인증번호 확인 폼 제출
  const onSubmitVerify: SubmitHandler<VerifyFormInputs> = async (data) => {
    setIsVerifying(true);
    console.log("인증번호 확인 데이터:", data);
    try {
      // POST /email/verify 요청
      const response = await axios.post(`${API_BASE_URL}/email/verify`, {
        authPassword: data.authCode,
      });
      console.log("인증번호 확인 성공:", response.data);
      // 인증 성공 시, userId를 쿼리 파라미터로 전달하며 reset 페이지로 이동
      router.push(`/user/find-password/reset?userId=${userId}`);
    } catch (error: any) {
      console.error("인증번호 확인 실패", error);
      if (error.response && error.response.status === 500) {
        // 500 에러 발생 시 인증번호 입력 필드에 에러 메시지 설정
        setVerifyError("authCode", {
          type: "manual",
          message: "인증번호가 잘못되었습니다.",
        });
      } else {
        alert("인증번호 확인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // 타이머 표시 (mm:ss 포맷)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://i12e203.p.ssafy.io/images/bg1.png')" }}
    >
      <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 border-t-4 border-blue-500">
        {/* 뒤로가기 버튼 */}
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-blue-500 hover:underline">
          뒤로가기
        </button>
        <h2 className="text-center text-3xl font-bold text-blue-900 mb-6">비밀번호 찾기</h2>

        {step === "request" && (
          <form onSubmit={handleSubmit(onSubmitRequest)} className="space-y-6">
            <InputField
              label="아이디"
              type="text"
              placeholder="아이디 입력"
              {...register("userId", { required: "아이디는 필수 입력 항목입니다." })}
              error={errors.userId?.message as string}
            />
            <InputField
              label="이메일"
              type="email"
              placeholder="example@sea.com"
              {...register("email", { required: "이메일은 필수 입력 항목입니다." })}
              error={errors.email?.message as string}
            />
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-teal-500 transition"
            >
              {isSending ? "로딩중..." : "인증번호 전송"}
            </button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleSubmitVerify(onSubmitVerify)} className="space-y-6">
            <div className="text-center text-xl font-semibold text-blue-800 mb-4">
              남은 시간: {formatTime(timer)}
            </div>
            <InputField
              label="인증번호"
              type="text"
              placeholder="인증번호 입력"
              {...registerVerify("authCode", { required: "인증번호는 필수 입력 항목입니다." })}
              error={errorsVerify.authCode?.message as string}
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-teal-400 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-teal-500 transition"
            >
              {isVerifying ? "로딩중..." : "확인"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
