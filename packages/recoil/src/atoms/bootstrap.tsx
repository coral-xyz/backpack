import { atom, selector, selectorFamily } from "recoil";
import { ParsedConfirmedTransaction, PublicKey } from "@solana/web3.js";
import {
  UI_RPC_METHOD_NAVIGATION_READ,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ,
} from "@coral-xyz/common";
import { anchorContext } from "../atoms/wallet";
import { TokenAccountWithKey, TABS } from "../types";
import { fetchRecentTransactions } from "./recent-transactions";
import { splTokenRegistry } from "./token-registry";
import { fetchPriceData, fetchPriceDataHistorical } from "./price-data";
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

      const [coingeckoData, historicalPriceData, recentTransactions] =
        await Promise.all([
          //
          // Fetch the price data.
          //
          fetchPriceData(splTokenAccounts, tokenRegistry),
          //
          //
          //
          fetchPriceDataHistorical(),
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
        historicalPriceData,
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
  default: null,
  effects: [
    ({ setSelf, getPromise }) => {
      setSelf(
        (async () => {
          // Fetch all navigation state.
          const bg = await getPromise(backgroundClient);
          const tabs = await Promise.all(
            TABS.map((t) =>
              bg.request({
                method: UI_RPC_METHOD_NAVIGATION_READ,
                params: [t[0]],
              })
            )
          );
          const activeTab = await bg.request({
            method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ,
            params: [],
          });
          return {
            tabs,
            activeTab,
          };
        })()
      );
    },
  ],
});
