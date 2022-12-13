import { useRecoilValue } from "recoil";

import { newAvatarAtom } from "../atoms";

import { useUser } from "./preferences";

export function useAvatarUrl(size: number, givenUsername?: string): string {
  const newAvatar = useRecoilValue(newAvatarAtom); // reload images when avatar changed.
  const username = givenUsername ?? useUser().username;
  const _username = username === "" || username === null ? "dev" : username;
  return (
    "https://swr-data.xnfts.dev/avatars/" +
    _username +
    "?newAvatar=" +
    newAvatar?.id
  );
}
