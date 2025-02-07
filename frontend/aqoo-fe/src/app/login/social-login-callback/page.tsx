"use client";

export const dynamic = 'force-dynamic';

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
      router.push("/login");
    }
  }, [router, searchParams]);

  return <div>로그인 중입니다...</div>;
}
