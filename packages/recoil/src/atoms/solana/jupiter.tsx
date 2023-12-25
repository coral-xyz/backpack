import { Blockchain } from "@coral-xyz/common";
import {
  SOL_NATIVE_MINT,
  WSOL_MINT,
} from "@coral-xyz/secure-clients/legacyCommon";
import type { TokenInfo } from "@solana/spl-token-registry";
import { selector, selectorFamily } from "recoil";

import type { TokenDataWithBalance } from "../../types";
import { blockchainBalancesSorted } from "../balance";

import { splTokenRegistry } from "./token-registry";

// Load the route map from the Jupiter API
const jupiterRouteMap = selector({
  key: "jupiterRouteMap",
  get: async () => {
    try {
      const [response, topTokensReversed] = await (async () => {
        const url =
          "https://quote-api.jup.ag/v6/indexed-route-map?onlyDirectRoutes=true";
        try {
          // Try to fetch the routes & top token list in parallel to reduce wait,
          // but fall back to just routes and an empty top token list if it fails
          return await Promise.all([
            (async () => {
              const res = await fetch(url);
              return await res.json();
            })(),
            (async () => {
              // Fetch the top token list so that it can be used to reorder the
              // list of available output tokens with the most popular ones first
              const res = await fetch(`https://cache.jup.ag/top-tokens`);
              const topTokens = await res.json();
              // Reverse the list so it makes the .sort() below a little easier
              return topTokens.reverse();
            })(),
          ]);
        } catch (err) {
          const res = await fetch(url);
          return [await res.json(), []];
        }
      })();

      const getMint = (index: number) => response["mintKeys"][index];

      // Replace indices with mint addresses
      return Object.keys(response["indexedRouteMap"]).reduce((acc, key) => {
        acc[getMint(parseInt(key))] = response["indexedRouteMap"][key]
          .map((i: number) => getMint(i))
          .sort(
            (a: any, b: any) =>
              topTokensReversed.indexOf(b) - topTokensReversed.indexOf(a)
          );
        return acc;
      }, {} as any);
    } catch (e) {
      console.log("failed to load Jupiter route map", e);
      return null;
    }
  },
});

export const jupiterTokenList = selector<TokenInfo[]>({
  key: "jupiterTokenList",
  get: async () => {
    try {
      return await (await fetch("https://token.jup.ag/strict")).json();
    } catch (e) {
      console.log("failed to load Jupiter token list", e);
      return [];
    }
  },
});

export const jupiterTokenMap = selector<Map<string, TokenInfo>>({
  key: "jupterTokenMap",
  get: ({ get }) => {
    const tokens = get(jupiterTokenList);
    const m = new Map();
    for (const t of tokens) {
      m.set(t.address, t);
    }
    return m;
  },
});

// All input tokens for Jupiter
const allJupiterInputMints = selector({
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
        (token: TokenDataWithBalance) =>
          inputMints.includes(token.mint!) || token.mint === SOL_NATIVE_MINT
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
          (tokenList.find((t: TokenInfo) => t.address === mint) ||
            tokenRegistry.get(mint)) ??
          ({} as TokenInfo);
        return {
          // Rewrite the name for Wrapped SOL because auto wrap/unwrap is set in
          // the API call, so it'll automatically unwrap wSOL.
          name:
            tokenMetadata.name === "Wrapped SOL"
              ? "Solana"
              : tokenMetadata.name,
          ticker: tokenMetadata.symbol,
          decimals: tokenMetadata.decimals,
          logo: tokenMetadata.logoURI,
          mint: tokenMetadata.address,
        };
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
          decimals: wrappedSol.decimals,
          mint: WSOL_MINT,
        });
      }

      // Filter out tokens that don't have at least name and ticker
      return swapTokens.filter((t: any) => t.name && t.ticker);
    },
});
