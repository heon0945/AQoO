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
    const accessToken = searchParams.get("accessToken");
    const userId = searchParams.get("userId");
    const nickName = searchParams.get("nickName") || "";
    // 신규 사용자 여부 플래그
    const isNewUser = searchParams.get("isNewUser") === "true";

    if (accessToken && userId) {
      // 소셜 로그인 함수를 호출하면 Recoil 상태와 localStorage에 정보가 저장됩니다.
      socialLogin(accessToken, userId, nickName);
      
      // 소셜 로그인 함수에서 loggedInUser에 이메일 정보가 저장되므로, 이를 사용합니다.
      const loggedInUser = localStorage.getItem("loggedInUser") || "";
      
      if (isNewUser) {
        // 신규 사용자라면 회원가입 페이지로 이동 (쿼리 파라미터로 이메일 전달)
        router.push(`/user/join?email=${encodeURIComponent(loggedInUser)}`);
      } else {
        // 이미 가입된 사용자라면 메인 페이지로 이동
        router.push("/test-recoil-query");
      }
    } else {
      router.push("/login");
    }
  }, [router, searchParams, socialLogin]);

  return <div>로그인 중입니다...</div>;
}
