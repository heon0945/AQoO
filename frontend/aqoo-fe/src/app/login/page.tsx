"use client"; // Next.js 13+ (app router) 환경에서 클라이언트 컴포넌트임을 명시

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRecoilState } from "recoil";
import { useRouter } from "next/navigation";
import { authState } from "@/store/authAtom";
import { useLogin } from "@/hooks/useAuth";

import InputField from "@/app/login/componets/InputField";
import LoginButton from "@/app/login/componets/LoginButton";

import { FcGoogle } from "react-icons/fc";
import { SiNaver } from "react-icons/si";

export default function LoginPage() {
  const router = useRouter();

  // react-hook-form에서 LoginRequest 타입에 맞게 폼을 세팅
  const { register, handleSubmit } = useForm({
    defaultValues: { id: "", pw: "" },
  });

  // Recoil 상태 (authState) 제어
  const [auth, setAuth] = useRecoilState(authState);

  // useLogin 훅 (React Query)
  // mutateAsync => Promise 기반으로 사용할 수 있음
  const { mutateAsync: login, isLoading } = useLogin();

  // 이미 로그인되어 있다면 메인 페이지로 이동
  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push("/main");
    }
  }, [auth, router]);

  // 폼 제출 시 로그인 요청
  async function onSubmit(formData: { id: string; pw: string }) {
    try {
      const response = await login(formData);
      // response 구조: { data: { userId }, headers: { accessToken } }
      const { userId } = response.data;
      const accessToken = response.headers.accessToken;

      if (userId && accessToken) {
        // Recoil 상태 업데이트
        setAuth({
          isAuthenticated: true,
          accessToken,
          user: { id: userId },
        });
        // 메인 페이지로 이동
        router.push("/main");
      } else {
        console.error("로그인 응답에 userId 또는 accessToken이 없습니다.");
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      // TODO: UI에 에러 메시지를 표시하거나 처리
    }
  }

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
            <a href="#" className="text-blue-500">아이디 / 비밀번호 찾기</a>
          </div>

          {/* 로그인 버튼 (로딩 상태에 따라 UI 제어) */}
          <LoginButton text="로그인" isLoading={isLoading} />
        </form>

        {/* 소셜 로그인 버튼들 */}
        <div className="mt-4 space-y-2">
          <LoginButton
            text="구글로 로그인"
            color="white"
            icon={<FcGoogle size={20} />}
          />
          <LoginButton
            text="네이버로 로그인"
            color="green"
            icon={<SiNaver size={20} color="white" />}
          />
        </div>
      </div>
    </div>
  );
}
