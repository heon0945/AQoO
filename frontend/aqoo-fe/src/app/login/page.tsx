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

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      await login(data.id, data.pw);
      router.push("/test-recoil-query"); // 로그인 성공 후 테스트 페이지로 이동
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/ocean-background.jpg')" }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-center text-2xl font-bold mb-6">로그인</h2>
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
            // 필요하다면 onClick 핸들러를 추가하세요.
          />
          <LoginButton
            text="네이버로 로그인"
            color="green"
            icon={<SiNaver size={20} color="white" />}
            // 필요하다면 onClick 핸들러를 추가하세요.
          />
        </div>
      </div>
    </div>
  );
}
