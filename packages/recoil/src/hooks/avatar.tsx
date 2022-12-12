import { useUser } from "./preferences";

export function useAvatarUrl(size: number, givenUsername?: string): string {
  const username = givenUsername ?? useUser().username;
  const _username = username === "" || username === null ? "dev" : username;
  return "https://swr.xnfts.dev/avatars/" + _username;
}
