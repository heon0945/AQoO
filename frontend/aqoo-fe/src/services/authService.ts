// src/services/authService.ts
import axios from "axios";
import { User } from "@/store/authAtom";

const AUTH_API_URL = "https://i12e203.p.ssafy.io/api/v1/auth";
const USER_API_URL = "https://i12e203.p.ssafy.io/api/v1/users";

/**
 * 로그인 API 호출
 * - 요청 시 id와 pw를 전송합니다.
 * - 응답 JSON 본문에서 accessToken을 추출해 localStorage에 저장합니다.
 * - 로그인 성공 시 입력받은 id 값을 사용자 식별자로 사용하여 User 객체를 반환합니다.
 */
export const login = async (id: string, pw: string): Promise<User> => {
  try {
    const res = await axios.post(
      `${AUTH_API_URL}/login`,
      { id, pw },
      { withCredentials: true }
    );

    // 응답 JSON 본문에서 accessToken 추출 (예: { accessToken: "token_value", message: "..." })
    const { accessToken,userId,nickName } = res.data;
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }

    // 로그인 성공 시 입력받은 id 값을 로컬에 저장 (userId로 사용)
    localStorage.setItem("loggedInUser", userId);

    // 백엔드에서 추가 사용자 정보가 없다면, 입력받은 id로 User 객체를 생성하여 반환합니다.
    return { id,nickName};
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "로그인 실패");
  }
};

/**
 * 로그아웃 API 호출
 * - 서버에 로그아웃 요청을 보내고, localStorage에 저장된 인증 정보를 삭제합니다.
 */
export const logout = async (): Promise<void> => {
  try {
    await axios.post(`${AUTH_API_URL}/logout`, {}, { withCredentials: true });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loggedInUser");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

/**
 * 저장된 accessToken을 이용해 로그인된 사용자 정보를 가져옵니다.
 */
export const fetchUser = async (): Promise<User | null> => {
  const token = localStorage.getItem("accessToken");
  const storedId = localStorage.getItem("loggedInUser");
  if (!token || !storedId) return null;

  try {
    const res = await axios.get(`${USER_API_URL}/${storedId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
