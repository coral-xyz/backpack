import { Blockchain } from "@coral-xyz/common";
import { selectorFamily } from "recoil";

import { useSolanaTokenInfo, useSplTokenRegistry } from "../hooks";
import type { TokenMetadata } from "../types";

import { splTokenRegistry } from "./solana";

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
            image: "",
            symbol: "",
          };
        default:
          throw new Error(`unsupported blockchain: ${blockchain}`);
      }
    },
});

const solanaTokenMetadata = selectorFamily<
  TokenMetadata | null,
  { mintAddress }
>({
  key: "solanaTokenMetadata",
  get:
    ({ mintAddress }) =>
    async ({ get }) => {
      if (mintAddress === "11111111111111111111111111111111111111111") {
        return {
          image: "",
          name: "Solana",
          symbol: "SOL",
        };
      }
      const url = `https://swr.xnfts.dev/nft-data/metaplex-nft/${mintAddress}/metadata`;
      try {
        const response = await fetch(url);
        const json = await response.json();
        return json;
      } catch (e) {
        console.error(e);
        const registry = get(splTokenRegistry);
        const tokenMetadata = registry?.get(mintAddress);
        if (tokenMetadata) {
          return {
            image: tokenMetadata.logoURI,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
          };
        }
      }
      return { name: "" };
    },
});
