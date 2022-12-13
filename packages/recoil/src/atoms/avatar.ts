import { atom } from "recoil";

type NewAvatar = {
  url: string;
  id: string;
};

/**
 * Store updated Avatar data
 */
export const newAvatarAtom = atom<NewAvatar | null>({
  key: "newAvatarAtom",
  default: null,
});
