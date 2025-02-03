//services/userService.ts

import { User } from "@/store/authAtom";
import axios from "axios";

// 테스트용 더미 API
const API_URL = "https://jsonplaceholder.typicode.com/users"; // ✅ 더미 API

// ✅ 반환 타입을 User[]로 명확히 지정
export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};
