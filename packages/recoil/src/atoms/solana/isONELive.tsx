import { Blockchain } from "@coral-xyz/common";
import { selector } from "recoil";

import { authenticatedUser } from "../preferences";
import { activeWallet } from "../wallet";

export const isOneLive = selector<{
  isLive: boolean;
  banner?: string;
  wlCollection?: string;
  madCollection?: string;
  byeBanner?: string;
}>({
  key: "isOneLive",
  get: async ({ get }) => {
    const wallet = get(activeWallet);
    const user = get(authenticatedUser);
    if (wallet?.blockchain !== Blockchain.SOLANA || !user) {
      return { isLive: false };
    }
    return (
      fetch("https://one.xnfts.dev/api/isLive")
        // return fetch("http://localhost:3000/api/isLive")
        .then((r) => r.json())
        .catch(() => ({ isLive: false }))
    );
  },
});
