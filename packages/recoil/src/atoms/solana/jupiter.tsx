import { selector, selectorFamily } from "recoil";
import { TokenInfo } from "@solana/spl-token-registry";
import { Blockchain, SOL_NATIVE_MINT, WSOL_MINT } from "@coral-xyz/common";
import { splTokenRegistry } from "./token-registry";
import { SOL_LOGO_URI } from "./token-registry";
import { blockchainBalancesSorted } from "../balance";

export const JUPITER_BASE_URL = "https://quote-api.jup.ag/v1/";

export const jupiterRouteMap = selector({
  key: "jupiterRouteMap",
  get: async () => {
    try {
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
    } catch (e) {
      console.log("failed to load Jupiter route map", e);
      return null;
    }
  },
});

// All input tokens for Jupiter
export const allJupiterInputMints = selector({
  key: "allJupiterInputMints",
  get: async ({ get }) => {
    const routeMap = get(jupiterRouteMap);
    if (routeMap) return Object.keys(routeMap);
    // API request fail
    else return [];
  },
});

// Jupiter tokens that can be swapped *from* owned by the currently active
// wallet.
export const jupiterInputMints = selector({
  key: "jupiterInputMints",
  get: async ({ get }) => {
    const inputMints = get(allJupiterInputMints);
    const walletTokens = get(blockchainBalancesSorted(Blockchain.SOLANA));
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
      const tokenRegistry = get(splTokenRegistry)!;
      // If input mint is SOL native then we can use WSOL with unwrapping
      const routeMapMint =
        inputMint === SOL_NATIVE_MINT ? WSOL_MINT : inputMint;
      if (!routeMap || !routeMap[routeMapMint]) return [];
      const swapTokens = routeMap[routeMapMint].map((mint: string) => {
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
      if (inputMint === SOL_NATIVE_MINT) {
        // Add wSOL as an output for native SOL. It won't show up here because
        // we are using routes for wSOL for native SOL, and wSOL is not an
        // output token for itself.
        const wrappedSol = tokenRegistry.get(WSOL_MINT);
        swapTokens.push({
          name: wrappedSol.name,
          ticker: wrappedSol.symbol,
          logo: wrappedSol.logoURI,
          mint: WSOL_MINT,
        });
      }
      // Filter out tokens that don't have at least name and ticker
      return swapTokens.filter((t: any) => t.name && t.ticker);
    },
});

export async function fetchJupiterRouteMap() {}
