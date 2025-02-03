import { User } from "@/store/authAtom";

// import axios from "axios";

// TODO 더미 말고 API 호출로 수정해줘야 할 것것

// const API_URL = "http://localhost:5000/api/auth"; // ✅ 백엔드 로그인 API URL

// ✅ 로그인된 사용자 정보 가져오기 (accessToken 이용)
export const fetchUser: () => Promise<User | null> = async () => {
  const token = localStorage.getItem("accessToken"); // ✅ 저장된 accessToken 가져오기
  if (!token) return null; // 로그인 정보 없음

  //////////////////////////////////////////////////////////////실제 API 호출출
  // try {
  //
  //   const res = await axios.get(`${API_URL}/users/me`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //     withCredentials: true,
  //   });

  //   return res.data;

  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // } catch (error) {
  //   return null; // 로그인 정보 없음
  // }
  /////////////////////////////////////////////////////////////

  // ✅ 로그인된 사용자 정보(localStorage) 반환 (더미 데이터)
  const storedUser = localStorage.getItem("loggedInUser");
  if (storedUser) {
    return JSON.parse(storedUser);
  }

  return null; // 로그인 정보 없음};
};

// 로그인 API 호출
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const login = async (username: string, password: string): Promise<User> => {
  // const res = await axios.post(`${API_URL}/login`, { username, password }, { withCredentials: true });
  // return res.data; // 로그인 성공 시 사용자 정보 반환

  // ✅ 더미
  return new Promise((resolve) => {
    setTimeout(() => {
      const userData: User = { id: 1, name: username, email: `${username}@example.com` };

      localStorage.setItem("accessToken", "dummy-access-token"); // ✅ 더미 토큰 저장
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
      resolve(userData); // ✅ 입력한 ID 기반 더미 데이터 반환
    }, 500);
  });
};

// 로그아웃 API 호출
export const logout = async (): Promise<void> => {
  // await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });

  // ✅ 더미
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem("accessToken"); // ✅ 더미 토큰 삭제
      localStorage.removeItem("loggedInUser"); // ✅ 저장된 사용자 정보 삭제

      resolve();
    }, 500);
  });
};
