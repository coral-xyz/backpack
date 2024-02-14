import { Blockchain } from "@coral-xyz/common";
import { selector } from "recoil";

import { activeWallet } from "../wallet";

export const isOneLive = selector<{
  isLive: boolean;
  wlCollection?: string;
  madladsCollection?: string;
  banner?: string;
  hasMadladBanner?: string;
  hasWLBanner?: string;
}>({
  key: "isOneLive",
  get: async ({ get }) => {
    const wallet = get(activeWallet);
    if (wallet?.blockchain !== Blockchain.SOLANA) {
      return { isLive: false };
    }
    return (
      fetch("https://one.xnfts.dev/api/isLive?wallet=" + wallet.publicKey)
        // return fetch("http://localhost:3000/api/isLive")
        .then((r) => r.json())
        .catch(() => ({ isLive: false }))
    );
  },
});
