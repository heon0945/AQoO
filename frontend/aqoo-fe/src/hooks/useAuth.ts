// src/hooks/useAuth.ts
import { useRecoilState } from "recoil";
import { authAtom } from "@/store/authAtom";
import { login as apiLogin, logout as apiLogout, fetchUser as apiFetchUser } from "@/services/authService";

export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authAtom);

  /**
   * 로그인 함수
   * - apiLogin 호출 후 반환된 데이터를 기반으로 accessToken과 사용자 id를 Recoil 상태에 저장합니다.
   */
  const login = async (id: string, pw: string): Promise<void> => {
    try {
      const user = await apiLogin(id, pw);
      const accessToken = localStorage.getItem("accessToken") || undefined;
      setAuth({
        isAuthenticated: true,
        user, // 입력받은 id를 그대로 사용자 식별자로 사용합니다.
        accessToken,
      });
    } catch (error: any) {
      throw new Error(error.message || "로그인 중 오류가 발생했습니다.");
    }
  };

  /**
   * 로그아웃 함수
   * - apiLogout 호출 후 Recoil 상태를 초기화합니다.
   */
  const logout = async (): Promise<void> => {
    await apiLogout();
    setAuth({ isAuthenticated: false });
  };

  /**
   * 저장된 accessToken을 이용해 사용자 정보를 불러와 상태를 업데이트합니다.
   */
  const fetchUser = async (): Promise<void> => {
    const user = await apiFetchUser();
    if (user) {
      setAuth({
        isAuthenticated: true,
        user,
        accessToken: localStorage.getItem("accessToken") || undefined,
      });
    } else {
      setAuth({ isAuthenticated: false });
    }
  };

  return { auth, login, logout, fetchUser };
};
