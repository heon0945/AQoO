"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SocialLoginCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const userId = searchParams.get("userId");
    const nickName = searchParams.get("nickName");

    if (accessToken && userId) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("loggedInUser", userId);
      localStorage.setItem("nickName", nickName || "");
      router.push("/test-recoil-query");
    } else {
      // 토큰이 없으면 로그인 페이지로 되돌림
      router.push("/login");
    }
  }, [router, searchParams]);

  return <div>로그인 처리 중...</div>;
}
