import { useUser } from "./preferences";

export function useAvatarUrl(size: number, givenUsername?: string): string {
  const username = givenUsername ?? useUser().username;
  const _username = username === "" || username === null ? "dev" : username;
  return "https://avatars.xnfts.dev/v1/" + _username + `?size=${size}`;
}
