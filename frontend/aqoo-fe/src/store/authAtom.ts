// src/store/authAtom.ts
import { atom } from "recoil";

export interface User {
  id: string;
  nickName: String;
  // 필요에 따라 name, email, 기타 필드를 추가할 수 있습니다.
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  accessToken?: string;
  // refreshToken은 보안상 쿠키로 관리하므로 store에 저장하지 않습니다.
}

export const authAtom = atom<AuthState>({
  key: "authAtom",
  default: { isAuthenticated: false },
});
