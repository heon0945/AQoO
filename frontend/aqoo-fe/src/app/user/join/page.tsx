"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";

interface JoinFormInputs {
  email: string;
  id: string;
  password?: string;
  nickName: string;
}

export default function JoinPage() {
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
      id: prefillEmail, // 이메일과 아이디를 동일하게
      password: "",
      nickName: "",
    },
  });

  const onSubmit: SubmitHandler<JoinFormInputs> = (data) => {
    console.log("회원가입 데이터:", data);
    // 가입 API 호출 후 성공 시 로그인 페이지 등으로 이동
    router.push("/user/login");
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://i12e203.p.ssafy.io/images/bg1.png')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 border-t-4 border-blue-500">
        <h2 className="text-center text-3xl font-bold text-blue-900 mb-6">회원가입</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 이메일 입력 */}
          <div>
            <label className="block text-sm font-semibold text-blue-800">이메일</label>
            <input
              type="email"
              placeholder="example@sea.com"
              className={`mt-1 block w-full px-3 py-2 border border-blue-300 rounded-lg placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 transition ${
                isSocialJoin ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
              {...register("email", { required: true })}
              disabled={isSocialJoin}
            />
            {errors.email && (
              <span className="text-red-500 text-xs">필수 입력 항목입니다.</span>
            )}
          </div>
          
          {/* 아이디 입력 */}
          <div>
            <label className="block text-sm font-semibold text-blue-800">아이디</label>
            <input
              type="text"
              placeholder="아이디"
              className={`mt-1 block w-full px-3 py-2 border border-blue-300 rounded-lg placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 transition ${
                isSocialJoin ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
              {...register("id", { required: true })}
              disabled={isSocialJoin}
            />
            {errors.id && (
              <span className="text-red-500 text-xs">필수 입력 항목입니다.</span>
            )}
          </div>
          
          {/* 비밀번호 입력 (일반 가입일 경우에만 보임) */}
          {!isSocialJoin && (
            <div>
              <label className="block text-sm font-semibold text-blue-800">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호"
                className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-lg placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 transition bg-white"
                {...register("password", { required: true })}
              />
              {errors.password && (
                <span className="text-red-500 text-xs">필수 입력 항목입니다.</span>
              )}
            </div>
          )}
          
          {/* 닉네임 입력 */}
          <div>
            <label className="block text-sm font-semibold text-blue-800">닉네임</label>
            <input
              type="text"
              placeholder="닉네임"
              className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-lg placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 transition bg-white"
              {...register("nickName", { required: true })}
            />
            {errors.nickName && (
              <span className="text-red-500 text-xs">필수 입력 항목입니다.</span>
            )}
          </div>

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
