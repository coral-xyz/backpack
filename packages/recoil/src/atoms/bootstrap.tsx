import { atom, selector } from "recoil";
import { ParsedConfirmedTransaction, PublicKey } from "@solana/web3.js";
import { UI_RPC_METHOD_NAVIGATION_READ } from "@coral-xyz/common";
import { TokenAccountWithKey } from "../types";
import { fetchPriceData } from "./prices";
import { backgroundClient } from "./client";
import { anchorContext } from "./solana/wallet";
import { activeWallet } from "./solana/wallet";
import { jupiterRouteMap } from "./solana/jupiter";
import { fetchRecentTransactions } from "./solana/recent-transactions";
import { splTokenRegistry } from "./solana/token-registry";

/**
 * Defines the initial app load fetch.
 */
export const bootstrap = selector<{
  splTokenAccounts: Map<string, TokenAccountWithKey>;
  splTokenMetadata: Array<any>;
  splNftMetadata: Map<string, any>;
  coingeckoData: Map<string, any>;
  recentTransactions: Array<ParsedConfirmedTransaction>;
  walletPublicKey: PublicKey;
}>({
  key: "bootstrap",
  get: async ({ get }: any) => {
    const tokenRegistry = get(splTokenRegistry);
    const { provider } = get(anchorContext);
    const walletPublicKey = new PublicKey(get(activeWallet));
    // Preload Jupiter route maps for swapper
    //		console.log('jup before');
    // TODO: do this in promise.all ?
    get(jupiterRouteMap); //.then(() => console.log('after then'));
    //		console.log('jup after');
    //
    // Perform data fetch.
    //
    try {
      //
      // Fetch token data.
      //
      const { tokenAccountsMap, tokenMetadata, nftMetadata } =
        await provider.connection.customSplTokenAccounts(walletPublicKey);
      const splTokenAccounts = new Map<string, TokenAccountWithKey>(
        tokenAccountsMap
      );

      const [coingeckoData, recentTransactions] = await Promise.all([
        //
        // Fetch the price data.
        //
        fetchPriceData(splTokenAccounts, tokenRegistry),
        //
        // Get the transaction data for the wallet's recent transactions.
        //
        fetchRecentTransactions(provider.connection, walletPublicKey),
      ]);

      //
      // Done.
      //
      return {
        splTokenAccounts,
        splTokenMetadata: tokenMetadata,
        splNftMetadata: new Map(nftMetadata),
        coingeckoData,
        recentTransactions,
        walletPublicKey,
      };
    } catch (err) {
      // TODO: show error notification.
      console.error(err);
      return {
        splTokenAccounts: new Map(),
        splTokenMetadata: [],
        splNftMetadata: new Map(),
        coingeckoData: new Map(),
        recentTransactions: [],
        walletPublicKey,
      };
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
