import { atom } from "recoil";
// spl-token-registry confirms to Uniswap token-list schema so can use type
import { TokenInfo } from "@solana/spl-token-registry";

export const ethereumTokenMetadata = atom<Map<string, TokenInfo> | null>({
  key: "ethereumTokenMetadata",
  default: null,
  effects: [
    ({ setSelf }) => {
      setSelf(
        fetch(
          // Uniswap default token list
          "https://gateway.ipfs.io/ipns/tokens.uniswap.org"
        ).then(async (response) => {
          const data = await response.json();
          return new Map(
            data.tokens.map((t: TokenInfo) => {
              return [t.address, t];
            })
          );
        })
      );
    },
  ],
});
