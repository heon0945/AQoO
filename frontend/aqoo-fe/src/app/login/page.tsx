"use client";

import { authState } from "@/store/authAtom";
import { useEffect } from "react";
import { useInput } from "@/hooks/useInput";
import { useLogin } from "@/hooks/useAuth";
import { useRecoilState } from "recoil";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const username = useInput(""); // ✅ userId로 변경
  const password = useInput("");

  const [auth] = useRecoilState(authState); // Recoil 상태 관리
  const { mutateAsync: login, isPending } = useLogin(); // React Query 로그인 요청

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push("/test-recoil-query");
    }
  }, [auth, router]);

  async function handleLogin() {
    await login({ username: username.value, password: password.value }); // ✅ 입력한 username이 로그인 데이터로 반영됨
    router.push("/test-recoil-query"); // 로그인 후 이동
  }

  return (
    <div>
      <input placeholder="Username" {...username} />
      <input type="password" placeholder="Password" {...password} />
      <button onClick={handleLogin} disabled={isPending}>
        {isPending ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
