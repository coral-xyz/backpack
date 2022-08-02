import { selector, selectorFamily } from "recoil";
import { TokenInfo } from "@solana/spl-token-registry";
import { Blockchain } from "@coral-xyz/common";
import { blockchainTokensSorted } from "./token";
import { splTokenRegistry } from "./token-registry";
import { bootstrap } from "../bootstrap";
import { SOL_NATIVE_MINT, WSOL_MINT } from "@coral-xyz/common";
import { SOL_LOGO_URI } from "./token-registry";

export const JUPITER_BASE_URL = "https://quote-api.jup.ag/v1/";

export const jupiterRouteMap = selector({
  key: "jupiterRouteMap",
  get: async ({ get }) => {
    const b = get(bootstrap);
    return b.jupiterRouteMap;
  },
});

// All input tokens for Jupiter
export const allJupiterInputMints = selector({
  key: "allJupiterInputMints",
  get: async ({ get }) => {
    const routeMap = get(jupiterRouteMap);
    return Object.keys(routeMap);
  },
});

// Jupiter tokens that can be swapped *from* owned by the currently active
// wallet.
export const jupiterInputMints = selector({
  key: "jupiterInputMints",
  get: async ({ get }) => {
    const inputMints = get(allJupiterInputMints);
    const walletTokens = get(blockchainTokensSorted(Blockchain.SOLANA));
    // Only allow tokens that Jupiter allows as well as native SOL.
    return walletTokens.filter(
      (t: any) => inputMints.includes(t.mint) || t.mint === SOL_NATIVE_MINT
    );
  },
});

export const jupiterOutputMints = selectorFamily({
  key: "jupiterOutputMints",
  get:
    ({ inputMint }: { inputMint: string }) =>
    ({ get }: any) => {
      const routeMap = get(jupiterRouteMap);
      // If input mint is SOL native then we can use WSOL with unwrapping
      const routeMapMint =
        inputMint === SOL_NATIVE_MINT ? WSOL_MINT : inputMint;
      const swapTokens = routeMap[routeMapMint].map((mint: string) => {
        const tokenRegistry = get(splTokenRegistry)!;
        const tokenMetadata = tokenRegistry.get(mint) ?? ({} as TokenInfo);
        const { name, symbol, logoURI } = tokenMetadata;
        return { name, ticker: symbol, logo: logoURI, mint };
      });
      // Add native SOL
      swapTokens.push({
        name: "Solana",
        ticker: "SOL",
        logo: SOL_LOGO_URI,
        mint: SOL_NATIVE_MINT,
      });
      // Filter out tokens that don't have at least name and ticker
      return swapTokens.filter((t: any) => t.name && t.ticker);
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
