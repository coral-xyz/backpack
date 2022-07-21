import { atom, selector, selectorFamily } from "recoil";
import * as atoms from ".";
import { Blockchain } from "@coral-xyz/common";

const ROUTE_MAP_URL = "https://quote-api.jup.ag/v1/indexed-route-map";
const WHITELIST = [
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", // SRM
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", // RAY
  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", // BTC
  "EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv", // FTT
  "ChVzxWRmrTeSgwd3Ui3UumcN8KX7VK3WaD4KGeSKpypj", // SUSHI
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", // ETH
  "2wpTofQ8SkACrkZWrZDjXPitYa8AwWgX8AfxdeBRRVLX", // LINK
  "BXZX2JRJFjvKazM1ibeDFxgAngKExb74MRXzXKvgikxX", // YFI
];
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
        const walletTokens = get(
          atoms.blockchainTokensSorted(Blockchain.SOLANA)
        );
        return routeMap[mint];
      }
    },
});
