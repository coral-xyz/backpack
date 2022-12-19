import { useRecoilValue } from "recoil";

import { newAvatarAtom } from "../atoms";

import { useUser } from "./preferences";

const sessionCacheBuster = Date.now();

export function useAvatarUrl(size?: number, givenUsername?: string): string {
  const username = givenUsername ?? useUser().username;
  const newAvatar = useRecoilValue(newAvatarAtom(username)); // reload images when avatar changed.
  const _username = username === "" || username === null ? "dev" : username;
  return newAvatar?.url
    ? newAvatar.url
    : "https://swr.xnfts.dev/avatars/" + _username + "/" + sessionCacheBuster;
}
