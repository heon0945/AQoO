//test-recoil-query/page.tsx
"use client";

import { useAuth, useLogout } from "@/hooks/useAuth";

import { User } from "@/store/authAtom";
import { useRouter } from "next/navigation"; // ✅ 올바른 경로
import { useUsers } from "@/hooks/useUsers";

export default function AuthAndUsersTestPage() {
  const { user, isAuthenticated } = useAuth();
  const { mutate: logout } = useLogout();
  const { data: users, isPending, error } = useUsers();

  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login"); // ✅ 로그아웃 후 로그인 페이지로 이동
  };

  console.log("로그 : ", user?.id);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">🔑 Recoil + React Query 테스트</h1>

      {/* 로그인 상태 테스트 */}
      <div className="mt-4 p-4 border rounded-lg shadow">
        <h2 className="text-lg font-semibold">🛠 로그인 상태</h2>
        <p>{isAuthenticated ? "✅ 로그인됨" : "❌ 로그아웃됨"}</p>
        {user && (
          <div>
            <p>👤 사용자: {user.name}</p>
            <p>📧 이메일: {user.email}</p>
          </div>
        )}
        <div className="mt-2">
          {isAuthenticated ? (
            <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleLogout}>
              로그아웃
            </button>
          ) : (
            <p>로그인이 필요합니다.</p>
          )}
        </div>
      </div>

      {/* 유저 목록 테스트 */}
      <div className="mt-8 p-4 border rounded-lg shadow">
        <h2 className="text-lg font-semibold">🌍 전체 유저 목록</h2>
        {isPending && <p>⏳ 데이터 로딩 중...</p>}
        {error && <p>❌ 데이터 가져오기에 실패했습니다.</p>}
        <ul>
          {users?.map((user: User) => (
            <li key={user.id} className="text-lg">
              {user.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
