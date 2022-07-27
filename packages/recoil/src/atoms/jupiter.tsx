import { atom, selector, selectorFamily } from "recoil";
import * as atoms from ".";
import { Blockchain } from "@coral-xyz/common";

const ROUTE_MAP_URL = "https://quote-api.jup.ag/v1/indexed-route-map";

export const jupiterRouteMap = selector({
  key: "jupiterRouteMap",
  get: async ({}) => {
    const response = await (await fetch(ROUTE_MAP_URL)).json();
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
        return routeMap[mint].map((mint: string) =>
          get(atoms.solanaMintRegistryMap({ mint }))
        );
      }
    },
});
