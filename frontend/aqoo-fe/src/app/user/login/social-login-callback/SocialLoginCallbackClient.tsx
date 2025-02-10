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
    const handleRedirect = async () => {
      try {
        const accessToken = searchParams.get("accessToken") || "";
        const userId = searchParams.get("userId") || "";
        const nickName = searchParams.get("nickName") || "";
        const isNewUser = searchParams.get("isNewUser") === "true";

        if (isNewUser && accessToken === "" && nickName === "" && userId) {
          await router.push(`/user/join?email=${encodeURIComponent(userId)}`);
        }
        else if (accessToken && userId) {
          await socialLogin(accessToken, userId, nickName);
          await router.push("/test-recoil-query");
        }
        else {
          await router.push("/user/login");
        }
      } catch (error) {
        console.error("Redirect error:", error);
      }
    };

    handleRedirect();

    // cleanup 함수 추가
    return () => {
      // 필요한 cleanup 로직
    };
  }, [router, searchParams, socialLogin]);


  return <div>로그인 중입니다...</div>;
}