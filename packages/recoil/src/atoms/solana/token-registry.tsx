import { atom } from "recoil";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { WSOL_MINT, SOL_NATIVE_MINT } from "@coral-xyz/common";

const SOL_LOGO_URI =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png";

export const splTokenRegistry = atom<Map<string, TokenInfo> | null>({
  key: "splTokenRegistry",
  default: null,
  effects: [
    ({ setSelf }) => {
      setSelf(
        new TokenListProvider().resolve().then((tokens) => {
          const tokenList = tokens
            .filterByClusterSlug("mainnet-beta") // TODO: get network atom.
            .getList();
          const tokenMap = tokenList.reduce((map, item) => {
            if (item.address === WSOL_MINT) {
              map.set(item.address, { ...item, symbol: "wSOL" });
            } else {
              map.set(item.address, item);
            }
            return map;
          }, new Map());
          tokenMap.set(SOL_NATIVE_MINT, {
            name: "Solana",
            address: SOL_NATIVE_MINT,
            chainId: 101,
            decimals: 9,
            symbol: "SOL",
            logoURI: SOL_LOGO_URI,
            extensions: {
              coingeckoId: "solana",
            },
          });
          return tokenMap;
        })
      );
    },
  ],
});
