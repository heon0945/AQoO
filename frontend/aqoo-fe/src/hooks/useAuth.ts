import { User, authState } from "@/store/authAtom";
import { fetchUser, login, logout } from "@/services/authService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useEffect } from "react";
import { useRecoilState } from "recoil";

// ✅ 현재 로그인 상태 확인
export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);

  const { data: user } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setAuth({ user: user || null, isAuthenticated: !!user });
  }, [user, setAuth]);

  return { user, isAuthenticated: auth.isAuthenticated };
};

// ✅ 로그인 요청
export const useLogin = () => {
  const [, setAuth] = useRecoilState(authState);
  const queryClient = useQueryClient(); // ✅ React Query의 캐시 관리 객체

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => login(username, password),
    onSuccess: (data: User) => {
      setAuth({ user: data, isAuthenticated: true });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// ✅ 로그아웃 요청
export const useLogout = () => {
  const [, setAuth] = useRecoilState(authState);
  const queryClient = useQueryClient(); // ✅ React Query의 캐시 관리 객체

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setAuth({ user: null, isAuthenticated: false });
      // ✅ 로그아웃 후 `fetchUser()` 실행하여 상태 초기화
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
