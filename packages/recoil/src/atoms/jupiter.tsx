import { selector, selectorFamily } from "recoil";
import { TokenInfo } from "@solana/spl-token-registry";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from ".";

export const JUPITER_BASE_URL = "https://quote-api.jup.ag/v1/";

export const jupiterRouteMap = selector({
  key: "jupiterRouteMap",
  get: async ({}) => {
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
    const walletTokens = get(atoms.blockchainTokensSorted(Blockchain.SOLANA));
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
              const tokenRegistry = get(atoms.splTokenRegistry)!;
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
