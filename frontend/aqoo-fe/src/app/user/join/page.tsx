"use client";

import React, { Suspense } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import InputField from "@/app/user/join/components/InputField";
import axios from "axios";
import { useToast } from "@/hooks/useToast";

interface JoinFormInputs {
  email: string;
  id: string;
  password: string; // 실제 비밀번호
  pw: string; // 비밀번호 확인
  nickName: string;
}

function JoinPageContent() {
  const { showToast } = useToast();

  const searchParams = useSearchParams();
  const router = useRouter();

  // URL 쿼리에서 email 값이 있다면 소셜 가입으로 간주합니다.
  const prefillEmail = searchParams.get("email") || "";
  const isSocialJoin = Boolean(prefillEmail);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JoinFormInputs>({
    defaultValues: {
      email: prefillEmail,
      id: prefillEmail, // 소셜 가입이면 이메일과 아이디가 동일한 값으로 채워집니다.
      password: "",
      pw: "",
      nickName: "",
    },
  });

  // 비밀번호와 비밀번호 확인 필드 감시
  const password = watch("password");
  const confirmPassword = watch("pw");

  // 비밀번호 보안 수준을 판단하는 함수 (길이 기준 예시)
  // 각 등급에 따라 다른 색상 적용: 하 - 빨강, 중 - 주황, 상 - 녹색
  const getPasswordStrength = (password: string): { text: string; colorClass: string } => {
    if (!password) return { text: "", colorClass: "" };
    if (password.length < 6) return { text: "보안 : 하", colorClass: "text-red-500" };
    if (password.length < 10) return { text: "보안 : 중", colorClass: "text-orange-500" };
    return { text: "보안 : 상", colorClass: "text-green-500" };
  };

  // SQL 인젝션 관련 키워드 및 특수문자 검사 함수
  const containsSQLInjection = (value: string): boolean => {
    const sqlKeywords = ["select", "insert", "update", "delete", "drop", "alter", "truncate"];
    const lowerValue = value.toLowerCase();
    for (const keyword of sqlKeywords) {
      if (lowerValue.includes(keyword)) {
        return true;
      }
    }
    if (value.includes("'") || value.includes('"') || value.includes("--") || value.includes(";")) {
      return true;
    }
    return false;
  };

  // 이메일 유효성 검사 함수
  const validateEmail = async (value: string): Promise<boolean | string> => {
    try {
      const response = await axios.post("https://i12e203.p.ssafy.io/api/v1/auth/validate-email", { email: value });
      return response.data.valid || "이미 사용 중인 이메일입니다.";
    } catch (error) {
      return "이메일 검증 중 오류가 발생했습니다.";
    }
  };

  // 아이디 유효성 검사 함수
  const validateId = async (value: string): Promise<boolean | string> => {
    try {
      const response = await axios.post("https://i12e203.p.ssafy.io/api/v1/auth/validate-id", { userId: value });
      return response.data.valid || "이미 사용 중인 아이디입니다.";
    } catch (error) {
      return "아이디 검증 중 오류가 발생했습니다.";
    }
  };

  const onSubmit: SubmitHandler<JoinFormInputs> = async (data) => {
    // 제출 시에도 SQL 인젝션 검사 (최종 방어)
    if (containsSQLInjection(data.id) || containsSQLInjection(data.password)) {
      showToast("다른 아이디나 비밀번호를 입력하세요.", "warning");
      return;
    }

    // 일반 가입인 경우, 비밀번호와 비밀번호 확인 일치 여부 확인
    if (!isSocialJoin && data.password !== data.pw) {
      showToast("비밀번호와 비밀번호 확인이 일치하지 않습니다.", "warning");
      return;
    }

    const requestBody = {
      email: data.email,
      id: data.id,
      pw: data.password, // 실제 비밀번호를 pw 필드에 할당
      nickName: data.nickName,
      isSocialLogin: isSocialJoin,
    };

    try {
      const response = await axios.post("https://i12e203.p.ssafy.io/api/v1/auth/register", requestBody);
      showToast("회원가입 성공!", "success");
      router.push("/user/login");
    } catch (error: any) {
      console.error("회원가입 실패:", error);
      showToast("회원가입 실패 : " + error.message, "error");
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="flex justify-center items-center h-screen bg-cover bg-center relative">
      <div
        className="absolute inset-0 bg-black before:absolute before:inset-0 before:bg-white/30"
        style={{
          backgroundImage: "url(/background-1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 border-t-4 border-blue-500">
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-blue-500 hover:underline">
          뒤로가기
        </button>
        <h2 className="text-center text-3xl font-bold text-blue-900 mb-6">회원가입</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isSocialJoin && (
            <>
              <InputField
                label="이메일"
                type="email"
                placeholder="example@sea.com"
                register={register("email", {
                  required: "필수 입력 항목입니다.",
                  validate: validateEmail,
                })}
                error={errors.email?.message as string}
              />
              <InputField
                label="아이디"
                type="text"
                placeholder="아이디"
                register={register("id", {
                  required: "필수 입력 항목입니다.",
                  onChange: (e) => {
                    const value = e.target.value;
                    if (containsSQLInjection(value)) {
                      showToast("다른 아이디나 비밀번호를 입력하세요.", "warning");
                      setValue("id", "");
                    }
                  },
                  validate: validateId,
                })}
                error={errors.id?.message as string}
              />
              <InputField
                label="비밀번호"
                type="password"
                placeholder="비밀번호"
                register={register("password", {
                  required: "필수 입력 항목입니다.",
                  onChange: (e) => {
                    const value = e.target.value;
                    if (containsSQLInjection(value)) {
                      showToast("다른 아이디나 비밀번호를 입력하세요.", "warning");
                      setValue("password", "");
                    }
                  },
                })}
                error={errors.password?.message as string}
              />
              {/* 비밀번호 보안 등급 안내 영역 */}
              {password && (
                <span className={`mt-0 text-sm ${passwordStrength.colorClass}`}>
                  {passwordStrength.text}
                </span>
              )}
              <InputField
                label="비밀번호 확인"
                type="password"
                placeholder="비밀번호 확인"
                register={register("pw", { required: "필수 입력 항목입니다." })}
                error={errors.pw?.message as string}
              />
              {/* 비밀번호 일치 여부 안내 영역 */}
              {confirmPassword && (
                <span className={`mt-0 text-sm ${confirmPassword === password ? "text-green-500" : "text-red-500"}`}>
                  {confirmPassword === password ? "비밀번호와 일치합니다." : "비밀번호와 다릅니다."}
                </span>
              )}
            </>
          )}
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
