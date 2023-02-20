import { atomFamily } from "recoil";

type NewAvatar = {
  url: string;
  id: string;
};
type Username = string;
/**
 * Store updated Avatar data
 */
export const newAvatarAtom = atomFamily<NewAvatar | null, Username>({
  key: "newAvatarAtom",
  default: null,
});
