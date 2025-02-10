'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SocialLoginCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socialLogin } = useAuth();

  // useSearchParams()에서 반환하는 객체는 매 렌더마다 새 객체를 생성하므로,
  // 안정된 값을 useMemo나 local 변수로 저장합니다.
  const accessToken = searchParams.get("accessToken") || "";
  const userId = searchParams.get("userId") || "";
  const nickName = searchParams.get("nickName") || "";
  const isNewUser = searchParams.get("isNewUser") === "true";

  useEffect(() => {
    // 신규 회원인 경우: accessToken와 nickName이 빈 문자열이면서 userId가 존재하면 회원가입 페이지로 이동
    if (isNewUser && accessToken === "" && nickName === "" && userId) {
      router.push(`/user/join?email=${encodeURIComponent(userId)}&isNewUser=true`);
    }
    // 기존 회원인 경우: accessToken과 userId 값이 존재하면 소셜 로그인 처리 후 메인 페이지로 이동
    else if (accessToken && userId) {
      socialLogin(accessToken, userId, nickName);
      router.push("/test-recoil-query");
    }
    // 그 외의 경우는 로그인 페이지로 이동
    else {
      router.push("/user/login");
    }
  // dependency 배열에는 안정된 값(accessToken, userId, nickName, isNewUser)만 포함
  }, [router, socialLogin, accessToken, userId, nickName, isNewUser]);

  return <div>로그인 중입니다...</div>;
}
