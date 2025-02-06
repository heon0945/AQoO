// store/authAtom.ts

import { atom } from "recoil";

// 사용자 정보를 위한 TypeScript 인터페이스 정의
export interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const authState = atom<AuthState>({
  key: "authState",
  default: {
    user: null,
    isAuthenticated: false,
  },
});
