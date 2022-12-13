import { atom } from "recoil";

type NewAvatar = {
  url: string;
  id: string;
};

/**
 * All NFT collections keyed by Blockchain.
 */
export const newAvatarAtom = atom<NewAvatar | null>({
  key: "newAvatarAtom",
  default: null,
});
