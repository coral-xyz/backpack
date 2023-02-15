import {
  BACKPACK_FEATURE_REFERRAL_FEES,
  Blockchain,
  SOL_NATIVE_MINT,
  WSOL_MINT,
} from "@coral-xyz/common";
import type { TokenInfo } from "@solana/spl-token-registry";
import { selector, selectorFamily } from "recoil";

import type { TokenDataWithBalance } from "../../types";
import { blockchainBalancesSorted } from "../balance";

import { SOL_LOGO_URI, splTokenRegistry } from "./token-registry";

export const JUPITER_BASE_URL = BACKPACK_FEATURE_REFERRAL_FEES
  ? "https://jupiter.xnfts.dev/v4/"
  : "https://quote-api.jup.ag/v4/";

// Load the route map from the Jupiter API
export const jupiterRouteMap = selector({
  key: "jupiterRouteMap",
  get: async () => {
    try {
      const response = await (
        await fetch(
          `${JUPITER_BASE_URL}indexed-route-map?onlyDirectRoutes=true`
        )
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

export const jupiterTokenList = selector({
  key: "jupiterTokenList",
  get: async () => {
    try {
      return await (await fetch("https://token.jup.ag/strict")).json();
    } catch (e) {
      console.log("failed to load Jupiter token list", e);
      return {};
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
export const jupiterInputTokens = selectorFamily({
  key: "jupiterInputTokens",
  get:
    ({ publicKey }: { publicKey: string }) =>
    async ({ get }) => {
      // Get all possible inputs rom the Jupiter route map
      const inputMints = get(allJupiterInputMints);
      // Get balances for the current public key
      const walletTokens = get(
        blockchainBalancesSorted({
          publicKey,
          blockchain: Blockchain.SOLANA,
        })
      );
      // Filter all Jupiter's input mints to only those that the wallet holds a
      // balance for, and always display native SOL.
      return walletTokens.filter(
        (t: any) => inputMints.includes(t.mint) || t.mint === SOL_NATIVE_MINT
      ) as Array<TokenDataWithBalance>;
    },
});

export const jupiterOutputTokens = selectorFamily({
  key: "jupiterOutputTokens",
  get:
    ({ inputMint }: { inputMint: string }) =>
    ({ get }: any) => {
      const routeMap = get(jupiterRouteMap);
      const tokenRegistry = get(splTokenRegistry)!;
      const tokenList = get(jupiterTokenList);

      // If input mint is SOL native then we can use WSOL with unwrapping
      const routeMapMint =
        inputMint === SOL_NATIVE_MINT ? WSOL_MINT : inputMint;
      if (!routeMap || !routeMap[routeMapMint]) return [];

      // Lookup
      const swapTokens = routeMap[routeMapMint].map((mint: string) => {
        const tokenMetadata =
          (tokenList.find((t) => t.address === mint) ||
            tokenRegistry.get(mint)) ??
          ({} as TokenInfo);
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
