import { selector } from "recoil";

import { activeSolanaWallet } from "../wallet";

export const isOneLive = selector({
  key: "isOneLive",
  get: async ({ get }) => {
    const wallet = get(activeSolanaWallet);
    if (!wallet) {
      return { isLive: false };
    }
    return fetch("https://one.xnfts.dev/api/isLive")
      .then((r) => r.json())
      .catch(() => ({ isLive: false }));
  },
});
