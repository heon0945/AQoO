'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SocialLoginCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socialLogin } = useAuth();

  useEffect(() => {
    // 각 값들을 기본값을 ""로 설정
    const accessToken = searchParams.get("accessToken") || "";
    const userId = searchParams.get("userId") || "";
    const nickName = searchParams.get("nickName") || "";
    const isNewUser = searchParams.get("isNewUser") === "true";

    // 만약 accessToken와 nickName이 빈 문자열이고, isNewUser가 true이면 회원가입 페이지로 이동
    if (isNewUser && accessToken === "" && nickName === "" && userId) {
      router.push(`/user/join?email=${encodeURIComponent(userId)}`);
    }
    // 그렇지 않고 accessToken과 userId 값이 존재하면 소셜 로그인 후 메인 페이지로 이동
    else if (accessToken && userId) {
      socialLogin(accessToken, userId, nickName);
      router.push("/test-recoil-query");
    }
    // 그 외의 경우는 로그인 페이지로 이동
    else {
      router.push("/user/login");
    }
  }, [router, searchParams, socialLogin]);

  return <div>로그인 중입니다...</div>;
}
