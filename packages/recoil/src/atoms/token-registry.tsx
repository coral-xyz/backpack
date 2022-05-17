import { atom } from "recoil";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";

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
            map.set(item.address, item);
            return map;
          }, new Map());
          tokenMap.set(PublicKey.default.toString(), {
            name: "Solana",
            address: PublicKey.default.toString(),
            chainId: 101,
            decimals: 9,
            symbol: "SOL",
            logoURI:
              "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
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
