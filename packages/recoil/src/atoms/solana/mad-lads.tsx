import { Blockchain } from "@coral-xyz/common";
import { createStakeApi } from "@coral-xyz/soulbound";
import { selector } from "recoil";

import { activeWallet } from "../wallet";

import { solanaWalletCollections } from "./nft";
import { anchorContext } from "./wallet";

export const madLadGold = selector<Map<string, any>>({
  key: "madLadGold",
  get: async ({ get }) => {
    const { provider } = get(anchorContext);
    const stakeApi = createStakeApi(provider);
    console.log("ARMANI HERE STAKE", stakeApi);
    const { blockchain, publicKey } = get(activeWallet);
    if (blockchain !== Blockchain.SOLANA) {
      return new Map();
    }
    const all = get(solanaWalletCollections({ publicKey }));
    if (all === null) {
      return new Map();
    }
    const madLadCollection = all.collections.find((c) => c.isMadlads);
    console.log("ARMANI HERE", stakeApi, madLadCollection);
    return new Map();
  },
});

/*
global:
- reward distributor account

for each nft:

- stake entry account
- reward entry account
- token account
*/
