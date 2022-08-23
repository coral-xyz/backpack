import { atom, selector } from "recoil";
import { BigNumber } from "ethers";
import { ParsedConfirmedTransaction, PublicKey } from "@solana/web3.js";
import {
  fetchXnfts,
  Blockchain,
  UI_RPC_METHOD_NAVIGATION_READ,
} from "@coral-xyz/common";
import { SolanaTokenAccountWithKey } from "../types";
import { fetchPriceData } from "./prices";
import { backgroundClient } from "./client";
import { activeWalletsWithData } from "./wallet";
import { anchorContext } from "./solana/wallet";
import { splTokenRegistry } from "./solana/token-registry";
import { fetchJupiterRouteMap } from "./solana/jupiter";
import { ethereumTokenMetadata } from "./ethereum/token-metadata";
import { ethereumTokenBalances } from "./ethereum/token";

/**
 * Defines the initial app load fetch.
 */
export const bootstrap = selector<{
  ethTokenBalances: Map<string, BigNumber>;
  ethTokenAddresses: Array<string>;
  ethTokenMetadata: Map<string, any>;
  splTokenAccounts: Map<string, SolanaTokenAccountWithKey>;
  splTokenMetadata: Array<any>;
  splNftMetadata: Map<string, any>;
  coingeckoData: Map<string, any>;
  jupiterRouteMap: Promise<any>;
  xnfts: Array<any>;
}>({
  key: "bootstrap",
  get: async ({ get }: any) => {
    const ethereumData = get(ethereumBootstrap);
    const solanaData = get(solanaBootstrap);
    const tokenRegistry = get(splTokenRegistry);

    try {
      //
      // Fetch the price data.
      // TODO add Ethereum pricing
      //
      const coingeckoData = await fetchPriceData(
        solanaData.splTokenAccounts,
        tokenRegistry
      );
      return {
        ...solanaData,
        ...ethereumData,
        coingeckoData,
        // TODO add Ethereum recent transactions
        recentTransactions: solanaData.recentTransactions,
      };
    } catch (err) {
      console.log(err);
      return {
        ...solanaData,
        ...ethereumData,
        coingeckoData: new Map(),
        recentTransactions: [],
        xnfts: [],
      };
    }
  },
});

export const ethereumBootstrap = selector<{
  ethActivePublicKey: string | null;
  ethTokenBalances: Map<string, BigNumber>;
  ethTokenAddresses: Array<string>;
  ethTokenMetadata: Map<string, any>;
}>({
  key: "ethereumBootstrap",
  get: ({ get }: any) => {
    const activeWallets = get(activeWalletsWithData);
    const publicKey =
      activeWallets.find((w: any) => w!.blockchain === Blockchain.ETHEREUM)
        ?.publicKey ?? null;

    const defaultReturn = {
      ethActivePublicKey: null,
      ethTokenAddresses: [],
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

    const ethTokenAddresses = [...ethTokenMetadata.values()].map(
      (token) => token.address
    );
    const ethTokenBalances = get(
      ethereumTokenBalances({
        contractAddresses: ethTokenAddresses,
        publicKey,
      })
    );
    return {
      ethActivePublicKey: publicKey,
      ethTokenAddresses,
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
  xnfts: any;
}>({
  key: "solanaBootstrap",
  get: async ({ get }: any) => {
    const activeWallets = get(activeWalletsWithData);
    const publicKey =
      activeWallets.find((w: any) => w.blockchain === Blockchain.SOLANA)
        ?.publicKey ?? null;

    const defaultReturn = {
      solActivePublicKey: null,
      splTokenAccounts: new Map(),
      splTokenMetadata: [],
      splNftMetadata: new Map(),
      jupiterRouteMap: Promise.resolve({}),
      xnfts: [],
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
    const fetchXnftsPromise = await fetchXnfts(
      provider,
      new PublicKey(publicKey)
    );

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
