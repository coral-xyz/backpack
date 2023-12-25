import { Blockchain } from "@coral-xyz/common";
import { selectorFamily } from "recoil";

import type { TokenMetadata } from "../types";

import { splTokenRegistry } from "./solana";

export const tokenMetadata = selectorFamily<
  TokenMetadata | null,
  // @ts-ignore
  { mintAddress; blockchain }
>({
  key: "tokenMetadata",
  get:
    ({ mintAddress, blockchain }: any) =>
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
            decimals: 0,
          };
        default:
          throw new Error(`unsupported blockchain: ${blockchain}`);
      }
    },
});

export const solanaTokenMetadata = selectorFamily<
  TokenMetadata | null,
  // @ts-ignore
  { mintAddress }
>({
  key: "solanaTokenMetadata",
  get:
    ({ mintAddress }: any) =>
    async ({ get }) => {
      if (
        mintAddress === "11111111111111111111111111111111111111111" ||
        mintAddress === "So11111111111111111111111111111111111111111"
      ) {
        return {
          image:
            "https://assets.coingecko.com/coins/images/4128/large/solana.png",
          name: "Solana",
          symbol: "SOL",
          decimals: 9,
        };
      }
      const url = `https://swr.xnftdata.com/nft-data/metaplex-nft/${mintAddress}/metadata`;
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
            decimals: tokenMetadata.decimals,
          };
        }
      }
      return { name: "" };
    },
});
