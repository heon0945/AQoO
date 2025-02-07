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
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 일반 로그인 처리
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      await login(data.id, data.pw);
      router.push("/test-recoil-query");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 소셜 로그인 버튼 클릭 시, 백엔드의 OAuth2 엔드포인트로 브라우저를 이동
   */
  const handleSocialLogin = (provider: "google" | "naver") => {
    const url =
      provider === "google"
        ? "https://i12e203.p.ssafy.io/oauth2/authorization/google"
        : "https://i12e203.p.ssafy.io/oauth2/authorization/naver";
    window.location.href = url;
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://i12e203.p.ssafy.io/images/bg1.png')" }}
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
