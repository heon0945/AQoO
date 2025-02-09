// SocialLoginCallbackClient.tsx
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

    if (accessToken && userId) {
      // 소셜 로그인 함수를 호출하여 Recoil 상태와 localStorage를 업데이트합니다.
      socialLogin(accessToken, userId, nickName);
      router.push("/test-recoil-query");
    } else {
      router.push("/login");
    }
  }, [router, searchParams, socialLogin]);

  return <div>로그인 중입니다...</div>;
}
