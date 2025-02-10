"use client";

import React, { Suspense } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import InputField from "@/app/user/join/components/InputField";
import axiosInstance from "@/services/axiosInstance" // axios 인스턴스 import (경로는 환경에 맞게 조정)
import axios from "axios";

interface JoinFormInputs {
  email: string;
  id: string;
  password?: string;
  nickName: string;
}

function JoinPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL 쿼리에서 email이 있다면 소셜 가입으로 간주합니다.
  const prefillEmail = searchParams.get("email") || "";
  const isSocialJoin = Boolean(prefillEmail);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFormInputs>({
    defaultValues: {
      email: prefillEmail,
      id: prefillEmail, // 이메일과 아이디를 동일하게 채워줍니다.
      password: "",
      nickName: "",
    },
  });

  const onSubmit: SubmitHandler<JoinFormInputs> = async (data) => {
    // 요청 본문에 소셜 로그인 여부 추가
    const requestBody = { ...data, isSocialLogin: isSocialJoin };
    try {
      console.log("보낼 데이터 : " + requestBody)
      const response = await axios.post("https://i12e203.p.ssafy.io/api/v1/auth/register", requestBody);
      console.log("회원가입 성공:", response.data);
      router.push("/user/login");
    } catch (error: any) {
      console.error("회원가입 실패:", error);
      alert(error.message);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://i12e203.p.ssafy.io/images/bg1.png')" }}
    >
      <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 border-t-4 border-blue-500">
        {/* 뒤로가기 버튼 - 카드 왼쪽 상단에 위치 */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-blue-500 hover:underline"
        >
          뒤로가기
        </button>
        <h2 className="text-center text-3xl font-bold text-blue-900 mb-6">회원가입</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 이메일 입력 */}
          <InputField
            label="이메일"
            type="email"
            placeholder="example@sea.com"
            register={register("email", { required: "필수 입력 항목입니다." })}
            disabled={isSocialJoin}
            error={errors.email?.message as string}
          />

          {/* 아이디 입력 */}
          <InputField
            label="아이디"
            type="text"
            placeholder="아이디"
            register={register("id", { required: "필수 입력 항목입니다." })}
            disabled={isSocialJoin}
            error={errors.id?.message as string}
          />

          {/* 비밀번호 입력 (일반 가입일 경우에만 보임) */}
          {!isSocialJoin && (
            <InputField
              label="비밀번호"
              type="password"
              placeholder="비밀번호"
              register={register("password", { required: "필수 입력 항목입니다." })}
              error={errors.password?.message as string}
            />
          )}

          {/* 닉네임 입력 */}
          <InputField
            label="닉네임"
            type="text"
            placeholder="닉네임"
            register={register("nickName", { required: "필수 입력 항목입니다." })}
            error={errors.nickName?.message as string}
          />

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-teal-500 transition"
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <JoinPageContent />
    </Suspense>
  );
}
