import { atom, selectorFamily } from "recoil";
import { PublicKey } from "@solana/web3.js";
import {
  getBackgroundClient,
  UI_RPC_METHOD_NAVIGATION_READ,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ,
} from "@200ms/common";
import { anchorContext } from "../atoms/wallet";
import { TokenAccountWithKey, TABS } from "../types";
import { fetchRecentTransactions } from "./recent-transactions";
import { splTokenRegistry } from "./token-registry";
import { fetchPriceData } from "./price-data";

/**
 * Defines the initial app load fetch.
 */
export const bootstrap = selectorFamily<
  {
    splTokenAccounts: Map<string, TokenAccountWithKey>;
    splTokenMetadata: Array<any>;
    splNftMetadata: Map<string, any>;
    coingeckoData: Map<string, any>;
    recentTransactions: Array<any>;
    walletPublicKey: PublicKey;
  },
  { publicKey: string; connectionUrl: string }
>({
  key: "bootstrap",
  get:
    ({
      publicKey,
      connectionUrl,
    }: {
      publicKey: string;
      connectionUrl: string;
    }) =>
    async ({ get }: any) => {
      const tokenRegistry = get(splTokenRegistry);
      const { provider } = get(anchorContext);
      const walletPublicKey = new PublicKey(publicKey);

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
