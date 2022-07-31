import { selector, selectorFamily } from "recoil";
import { TokenInfo } from "@solana/spl-token-registry";
import { Blockchain } from "@coral-xyz/common";
import { blockchainTokensSorted } from "./token";
import { splTokenRegistry } from "./token-registry";
import { bootstrap } from "../bootstrap";

export const JUPITER_BASE_URL = "https://quote-api.jup.ag/v1/";

export const jupiterRouteMap = selector({
  key: "jupiterRouteMap",
  get: async ({ get }) => {
    const b = get(bootstrap);
    return b.jupiterRouteMap;
  },
});

// All input tokens for Jupiter
export const jupiterInputMints = selector({
  key: "jupiterInputMints",
  get: async ({ get }) => {
    const routeMap = get(jupiterRouteMap);
    return Object.keys(routeMap);
  },
});

// Jupiter tokens that can be swapped *from* owned by the currently active
// wallet.
export const walletJupiterTokens = selector({
  key: "walletJupiterTokens",
  get: async ({ get }) => {
    const inputMints = get(jupiterInputMints);
    const walletTokens = get(blockchainTokensSorted(Blockchain.SOLANA));
    // Only allow tokens that Jupiter allows.
    return walletTokens.filter((t: any) => inputMints.includes(t.mint));
  },
});

export const swapTokenList = selectorFamily({
  key: "swapTokenList",
  get:
    ({ mint, isFrom }: { mint: string; isFrom: boolean }) =>
    ({ get }: any) => {
      if (isFrom) {
        return get(walletJupiterTokens);
      } else {
        const routeMap = get(jupiterRouteMap);
        return (
          routeMap[mint]
            .map((mint: string) => {
              const tokenRegistry = get(splTokenRegistry)!;
              const tokenMetadata =
                tokenRegistry.get(mint) ?? ({} as TokenInfo);
              const { name, symbol, logoURI } = tokenMetadata;
              return { name, ticker: symbol, logo: logoURI, mint };
            })
            // Filter out tokens that don't have at least name and ticker
            .filter((t: any) => t.name && t.ticker)
        );
      }
    },
});

export async function fetchJupiterRouteMap() {
  const response = await (
    await fetch(`${JUPITER_BASE_URL}indexed-route-map`)
  ).json();
  const getMint = (index: number) => response["mintKeys"][index];
  // Replace indices with mint addresses
  return Object.keys(response["indexedRouteMap"]).reduce((acc, key) => {
    acc[getMint(parseInt(key))] = response["indexedRouteMap"][key].map(
      (i: number) => getMint(i)
    );
    return acc;
  }, {});
}
