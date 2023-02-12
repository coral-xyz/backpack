import { Blockchain } from "@coral-xyz/common";
import { selectorFamily } from "recoil";

import type { TokenMetadata } from "../types";
import { TokenData } from "../types";

export const tokenMetadata = selectorFamily<
  TokenMetadata | null,
  { mintAddress; blockchain }
>({
  key: "tokenMetadata",
  get:
    ({ mintAddress, blockchain }) =>
    ({ get }) => {
      switch (blockchain) {
        case Blockchain.SOLANA:
          return get(solanaTokenMetadata({ mintAddress }));
        case Blockchain.ETHEREUM:
          //TODO: implement for eth
          return {
            name: "",
          };
        default:
          throw new Error(`unsupported blockchain: ${blockchain}`);
      }
    },
});

export const solanaTokenMetadata = selectorFamily<
  TokenMetadata | null,
  { mintAddress }
>({
  key: "solanaTokenMetadata",
  get:
    ({ mintAddress }) =>
    async ({ get }) => {
      const url = `https://nft-data.backpack.workers.dev/metaplex-nft/${mintAddress}/metadata`;
      try {
        const response = await fetch(url);
        const json = await response.json();
        return json;
      } catch (e) {
        console.error(e);
      }
      return { name: "" };
    },
});
