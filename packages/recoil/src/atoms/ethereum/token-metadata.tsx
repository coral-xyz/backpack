import { atom, selector } from "recoil";
import { ETH_NATIVE_MINT } from "@coral-xyz/common";
// spl-token-registry confirms to Uniswap token-list schema so can use type
import { TokenInfo } from "@solana/spl-token-registry";

export const ETH_LOGO_URI =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";

export const ethereumTokenMetadata = atom<Map<string, TokenInfo> | null>({
  key: "ethereumTokenMetadata",
  default: selector({
    key: "ethereumTokenMetadataDefault",
    get: async () => {
      const response = await fetch(
        // Uniswap default token list
        "https://gateway.ipfs.io/ipns/tokens.uniswap.org"
      );
      const data = await response.json();
      const tokenMap: Map<string, TokenInfo> = new Map(
        data.tokens.map((t: TokenInfo) => {
          return [t.address, t];
        })
      );
      tokenMap.set(ETH_NATIVE_MINT, {
        name: "Ethereum",
        address: ETH_NATIVE_MINT,
        chainId: 1,
        decimals: 18,
        symbol: "ETH",
        logoURI: ETH_LOGO_URI,
        extensions: {
          coingeckoId: "ethereum",
        },
      } as TokenInfo);
      return tokenMap;
    },
  }),
});
