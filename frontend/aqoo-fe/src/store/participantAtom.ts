import { atom } from "recoil";

export interface Friend {
  id: string;
  nickname: string;
  level: number;
  fishImage?: string;
  status?: "READY" | "WAITING";
  isHOst?: boolean;
}

export const participantsState = atom<Friend[]>({
  key: "participantsState",
  default: [],
});

export const addedFriendsState = atom<string[]>({
  key: "addedFriendsState",
  default: [],
});