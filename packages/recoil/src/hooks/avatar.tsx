import { useUsername } from "./preferences";

export function useAvatarUrl(size: number): string {
  const username = useUsername();
  const _username = username === "" || username === null ? "dev" : username;
  return "https://avatars.xnfts.dev/v1/" + _username + `?size=${size}`;
}
