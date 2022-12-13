import { useRecoilValue } from "recoil";

import { newAvatarAtom } from "../atoms";

import { useUser } from "./preferences";

export function useAvatarUrl(size?: number, givenUsername?: string): string {
  const newAvatar = useRecoilValue(newAvatarAtom); // reload images when avatar changed.
  const username = givenUsername ?? useUser().username;
  const _username = username === "" || username === null ? "dev" : username;
  return newAvatar?.url
    ? newAvatar.url
    : "https://swr.xnfts.dev/avatars/" + _username;
}
