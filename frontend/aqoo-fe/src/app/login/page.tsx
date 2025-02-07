"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { SiNaver } from "react-icons/si";
import LoginButton from "@/app/login/componets/LoginButton";
import InputField from "@/app/login/componets/InputField";

interface LoginFormInputs {
  id: string;
  pw: string;
}

export default function LoginPage() {
  // react-hook-form을 사용하여 입력값 관리
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  // 일반 로그인 함수 (아이디/비밀번호 로그인)
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 일반 로그인 폼 제출 처리 함수
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      await login(data.id, data.pw);
      // 로그인 성공 후 이동할 페이지
      router.push("/test-recoil-query");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 소셜 로그인 처리 함수
   * @param provider "google" | "naver"
   */
  const handleSocialLogin = async (provider: "google" | "naver") => {
    // 소셜 로그인에 사용할 백엔드 엔드포인트 선택
    const url =
      provider === "google"
        ? "https://i12e203.p.ssafy.io/oauth2/authorization/google"
        : "https://i12e203.p.ssafy.io/oauth2/authorization/naver";

    try {
      // GET 요청 전송 (쿠키 포함)
      const res = await fetch(url, {
        method: "GET",
        credentials: "include"
      });

      // 응답 상태 체크
      if (!res.ok) {
        throw new Error("소셜 로그인 요청에 실패했습니다.");
      }

      // 응답 JSON 파싱 (accessToken, userId, nickName 포함)
      const data = await res.json();
      const { accessToken, userId, nickName } = data;

      // accessToken과 userId를 localStorage에 저장
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      localStorage.setItem("loggedInUser", userId);

      // (필요시) 전역 상태 관리(auth 상태)를 업데이트할 수 있습니다.

      // 로그인 성공 후 리다이렉트
      router.push("/test-recoil-query");
    } catch (error: any) {
      console.error("소셜 로그인 에러:", error);
      alert(error.message || "소셜 로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://13.124.6.53/images/bg1.png')" }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-center text-2xl font-bold mb-6">로그인</h2>
        {/* 일반 로그인 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="아이디"
            placeholder="아이디"
            register={register("id", { required: true })}
          />
          <InputField
            label="비밀번호"
            type="password"
            placeholder="비밀번호"
            register={register("pw", { required: true })}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              자동 로그인
            </label>
            <a href="#" className="text-blue-500">
              아이디 / 비밀번호 찾기
            </a>
          </div>

          <LoginButton text="로그인" isLoading={isLoading} />
        </form>

        {/* 소셜 로그인 버튼들 */}
        <div className="mt-4 space-y-2">
          <LoginButton
            text="구글로 로그인"
            color="white"
            icon={<FcGoogle size={20} />}
            // 폼 제출을 막기 위해 type을 "button"으로 지정합니다.
            type="button"
            onClick={() => handleSocialLogin("google")}
          />
          <LoginButton
            text="네이버로 로그인"
            color="green"
            icon={<SiNaver size={20} color="white" />}
            type="button"
            onClick={() => handleSocialLogin("naver")}
          />
        </div>
      </div>
    </div>
  );
}
