import { atom, selector } from "recoil";
import { ParsedConfirmedTransaction, PublicKey } from "@solana/web3.js";
import { UI_RPC_METHOD_NAVIGATION_READ } from "@coral-xyz/common";
import { anchorContext } from "../atoms/wallet";
import { jupiterRouteMap } from "../atoms/jupiter";
import { TokenAccountWithKey } from "../types";
import { fetchRecentTransactions } from "./recent-transactions";
import { splTokenRegistry } from "./token-registry";
import { fetchPriceData } from "./price-data";
import { activeWallet } from "./wallet";
import { backgroundClient } from "./background";

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
    get(jupiterRouteMap);
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
