import { AVATAR_BASE_URL } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import { newAvatarAtom } from "../atoms";

import { useUser } from "./preferences";

const sessionCacheBuster = Date.now();

export function useAvatarUrl(size?: number, givenUsername?: string): string {
  return "https://madlads-merch.s3.us-east-2.amazonaws.com/darkAvatar.png";
  // const user = useUser();
  // const username = givenUsername ?? user.username;
  // const newAvatar = useRecoilValue(newAvatarAtom(username)); // reload images when avatar changed.
  // const _username = username === "" || username === null ? "dev" : username;
  // return newAvatar?.url
  //   ? newAvatar.url
  //   : AVATAR_BASE_URL + "/" + _username + "/" + sessionCacheBuster;
}
