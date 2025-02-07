export interface UserInfo {
  id: string;
  nickname: string;
  level: number;
  exp: number;
  mainAquarium: number;
}

// 🔹 어항 상태 데이터 타입 정의
export interface AquariumData {
  id: number;
  aquariumName: string;
  waterCondition: number;
  pollutionStatus: number;
  fullness: number;
}
