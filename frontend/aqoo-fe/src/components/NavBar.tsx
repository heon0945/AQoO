// components/NavBar.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavBar() {
  // useAuth 훅에서 auth 상태와 logout 함수를 받아옵니다.
  const { auth, logout } = useAuth();
  const { user, isAuthenticated } = auth;
  const router = useRouter();

  async function handleLogout() {
    await logout(); // 로그아웃 API 호출 및 상태/로컬 스토리지 정리
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-200 shadow">
      <Link href="/" className="text-lg font-bold">
        Home
      </Link>
      <div className="flex items-center space-x-4">
        {isAuthenticated && user ? (
          <>
            <span className="text-blue-600 font-medium">
              Welcome, {user.nickName}!
            </span>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
