import { atom, selector } from "recoil";
import { BigNumber } from "ethers";
import { ParsedConfirmedTransaction, PublicKey } from "@solana/web3.js";
import {
  fetchXnfts,
  ethereumBalances,
  UI_RPC_METHOD_NAVIGATION_READ,
} from "@coral-xyz/common";
import { SolanaTokenAccountWithKey } from "../types";
import { fetchPriceData } from "./prices";
import {
  recentEthereumTransactions,
  recentSolanaTransactions,
} from "./recent-transactions";
import { backgroundClient } from "./client";
import { ethereumPublicKey, solanaPublicKey } from "./wallet";
import { anchorContext } from "./solana/wallet";
import { splTokenRegistry } from "./solana/token-registry";
import { fetchJupiterRouteMap } from "./solana/jupiter";
import { ethereumTokenMetadata } from "./ethereum/token-metadata";
import { ethersContext } from "./ethereum/provider";
import { ethereumNft } from "./ethereum/nft";

/**
 * Defines the initial app load fetch.
 */
export const bootstrap = selector<{
  ethTokenBalances: Map<string, BigNumber>;
  ethTokenMetadata: Map<string, any>;
  splTokenAccounts: Map<string, SolanaTokenAccountWithKey>;
  splTokenMetadata: Array<any>;
  splNftMetadata: Map<string, any>;
  coingeckoData: Map<string, any>;
  jupiterRouteMap: Promise<any>;
  xnfts: Promise<any>;
}>({
  key: "bootstrap",
  get: async ({ get }: any) => {
    const ethereumData = get(ethereumBootstrap);
    const solanaData = get(solanaBootstrap);
    const tokenRegistry = get(splTokenRegistry);

    try {
      //
      // Fetch the price data.
      //
      const coingeckoData = await fetchPriceData(
        solanaData.splTokenAccounts,
        tokenRegistry,
        [...ethereumData.ethTokenBalances.keys()]
      );
      return {
        ...solanaData,
        ...ethereumData,
        coingeckoData,
      };
    } catch (err) {
      console.log(err);
      return {
        ...solanaData,
        ...ethereumData,
        coingeckoData: new Map(),
      };
    }
  },
});

export const ethereumBootstrap = selector<{
  ethActivePublicKey: string | null;
  ethTokenBalances: Map<string, BigNumber>;
  ethTokenMetadata: Map<string, any>;
}>({
  key: "ethereumBootstrap",
  get: async ({ get }: any) => {
    const publicKey = get(ethereumPublicKey);

    const defaultReturn = {
      ethActivePublicKey: null,
      ethTokenBalances: new Map(),
      ethTokenMetadata: new Map(),
    };

    if (!publicKey) {
      return defaultReturn;
    }

    const ethTokenMetadata = get(ethereumTokenMetadata);
    if (!ethTokenMetadata) {
      return defaultReturn;
    }

    const provider = get(ethersContext).provider;
    const ethTokenBalances = await ethereumBalances(provider, publicKey);

    // get(ethereumNft({ address: publicKey }));

    get(
      recentEthereumTransactions({
        address: publicKey,
      })
    );

    return {
      ethActivePublicKey: publicKey,
      ethTokenBalances,
      ethTokenMetadata,
    };
  },
});

export const solanaBootstrap = selector<{
  solActivePublicKey: string | null;
  splTokenAccounts: Map<string, SolanaTokenAccountWithKey>;
  splTokenMetadata: Array<any>;
  splNftMetadata: Map<string, any>;
  jupiterRouteMap: Promise<any>;
  xnfts: Promise<any>;
}>({
  key: "solanaBootstrap",
  get: async ({ get }: any) => {
    const publicKey = get(solanaPublicKey);

    const defaultReturn = {
      solActivePublicKey: null,
      splTokenAccounts: new Map(),
      splTokenMetadata: [],
      splNftMetadata: new Map(),
      jupiterRouteMap: Promise.resolve({}),
      xnfts: Promise.resolve([]),
    };

    if (!publicKey) {
      return defaultReturn;
    }

    const { provider } = get(anchorContext);
    //
    // Preload Jupiter route maps for swapper, not awaited to avoid blocking
    // the wallet if the Jupiter API does not respond.
    //
    const jupiterRouteMap = fetchJupiterRouteMap().catch((e) =>
      console.log("failed to load Jupiter route map", e)
    );

    //
    // Fetch xnfts immediately but don't block.
    //
    const fetchXnftsPromise = fetchXnfts(provider, new PublicKey(publicKey));

    get(recentSolanaTransactions({ address: publicKey }));

    //
    // Perform data fetch.
    //
    try {
      //
      // Fetch token data.
      //
      const { tokenAccountsMap, tokenMetadata, nftMetadata } =
        await provider.connection.customSplTokenAccounts(publicKey);
      const splTokenAccounts = new Map<string, SolanaTokenAccountWithKey>(
        tokenAccountsMap
      );
      //
      // Done.
      //
      return {
        solActivePublicKey: publicKey,
        splTokenAccounts,
        splTokenMetadata: tokenMetadata,
        splNftMetadata: new Map(nftMetadata),
        jupiterRouteMap,
        xnfts: fetchXnftsPromise,
      };
    } catch (err) {
      // TODO: show error notification.
      console.error("solana bootstrap error", err);
      return defaultReturn;
    }
  },
});

// Version of bootstrap for very fast data on load. This shouldn't block the load
// in any discernable way and can be called on initial load, regardless of the app
// being locked or unlocked.
export const bootstrapFast = atom<any>({
  key: "bootstrapFast",
  default: selector({
    key: "bootstrapFastDefault",
    get: async ({ get }) => {
      const bg = get(backgroundClient);
      const nav = await bg.request({
        method: UI_RPC_METHOD_NAVIGATION_READ,
        params: [],
      });
      return {
        nav,
      };
    },
  }),
});

/**
 * This is fetched once on loading the app for the initial url redirect
 * and is otherwise ignored.
 */
export const navData = atom<{
  activeTab: string;
  data: { [navId: string]: { id: string; urls: Array<string> } };
}>({
  key: "navigationState",
  default: selector({
    key: "navigationStateDefault",
    get: ({ get }: any) => {
      const { nav } = get(bootstrapFast);
      return nav;
    },
  }),
});
