import { atom, selector } from "recoil";
import { PublicKey } from "@solana/web3.js";
import {
  UI_RPC_METHOD_NAVIGATION_READ,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ,
} from "@200ms/common";
import { TokenAccountWithKey, TABS } from "../types";
import { getBackgroundClient } from "../background";
import { anchorContext } from "../atoms/wallet";
import { fetchRecentTransactions } from "./recent-transactions";
import { splTokenRegistry } from "./token-registry";
import { fetchPriceData } from "./price-data";
import { activeWallet } from "./wallet";

/**
 * Defines the initial app load fetch.
 */
export const bootstrap = atom<any>({
  key: "bootstrap",
  default: selector({
    key: "bootstrapSelector",
    get: async ({ get }: any) => {
      const tokenRegistry = get(splTokenRegistry);
      const { provider } = get(anchorContext);
      const _activeWallet = get(activeWallet);
      const walletPublicKey = new PublicKey(_activeWallet);

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

        const [coingeckoData, recentTransactions, recentBlockhash] =
          await Promise.all([
            //
            // Fetch the price data.
            //
            fetchPriceData(splTokenAccounts, tokenRegistry),
            //
            // Get the transaction data for the wallet's recent transactions.
            //
            fetchRecentTransactions(provider.connection, walletPublicKey),
            //
            // Get the recent blockhash for transaction construction.
            //
            provider.connection.getLatestBlockhash(),
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
          recentBlockhash: recentBlockhash.blockhash,
          walletPublicKey,
        };
      } catch (err) {
        // TODO: show error notification.
        console.error(err);
      }
    },
  }),
});

// Version of bootstrap for very fast data on load. This shouldn't block the load
// in any discernable way and can be called on initial load, regardless of the app
// being locked or unlocked.
export const bootstrapFast = atom<any>({
  key: "bootstrapFast",
  default: null,
  effects: [
    ({ setSelf }) => {
      setSelf(
        (async () => {
          // Fetch all navigation state.
          const backgroundClient = getBackgroundClient();
          const tabs = await Promise.all(
            TABS.map((t) =>
              backgroundClient.request({
                method: UI_RPC_METHOD_NAVIGATION_READ,
                params: [t[0]],
              })
            )
          );
          const activeTab = await backgroundClient.request({
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
