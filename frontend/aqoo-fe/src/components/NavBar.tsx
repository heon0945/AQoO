//components/NavBar.tsx
"use client";

import { useAuth, useLogout } from "@/hooks/useAuth";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const { user, isAuthenticated } = useAuth(); // ✅ Getter 역할

  //const [auth, setAuth] = useRecoilState(authState);
  const router = useRouter();
  const { mutateAsync: logout } = useLogout();

  async function handleLogout() {
    await logout(); // ✅ Setter 역할 (로그아웃 시 Recoil 초기화)
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
            <span className="text-blue-600 font-medium">Welcome, {user.name}!</span>
            <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
