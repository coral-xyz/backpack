import { atom, selector } from "recoil";
import { PublicKey } from "@solana/web3.js";
import { TokenAccountWithKey } from "./types";
import {
  UI_RPC_METHOD_NAVIGATION_READ,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_READ,
} from "../common";
import { getBackgroundClient } from "../background/client";
import { TABS } from "../background/backend";
import { fetchRecentTransactions } from "./recent-transactions";
import { anchorContext } from "./wallet";
import {
  splTokenRegistry,
  fetchTokens,
  fetchSplMetadata,
  fetchSplMetadataUri,
} from "./token";
import { fetchPriceData } from "./price-data";
import * as atoms from "./atoms";

/**
 * Defines the initial app load fetch.
 */
export const bootstrap = atom<any>({
  key: "bootstrap",
  default: selector({
    key: "bootstrapSelector",
    get: async ({ get }: any) => {
      const tokenRegistry = get(splTokenRegistry);
      const { provider, tokenClient } = get(anchorContext);
      const commitment = get(atoms.commitment);
      const activeWallet = get(atoms.activeWallet);
      const walletPublicKey = new PublicKey(activeWallet);

      //
      // Perform data fetch.
      //
      try {
        //
        // Fetch the SPL tokens.
        //
        const splTokenAccounts = await fetchTokens(
          walletPublicKey,
          tokenClient
        );
        const splTokenAccountsArray = Array.from(splTokenAccounts.values());

        //
        // Fetch the price data.
        //
        const coingeckoData = await fetchPriceData(
          splTokenAccounts,
          tokenRegistry
        );

        //
        // Fetch the token metadata.
        //
        const splTokenMetadata = await fetchSplMetadata(
          provider,
          splTokenAccountsArray
        );

        //
        // Fetch the metadata uri and interpert as NFTs.
        //
        const splNftMetadata = await fetchSplMetadataUri(
          splTokenAccountsArray,
          splTokenMetadata
        );

        //
        // Get the transaction data for the wallet's recent transactions.
        //
        //	const publicKey = new PublicKey('FhmUh2PEpTzUwBWPt4qgDBeqfmb2ES3T64CkT1ZiktSS');
        const publicKey = new PublicKey(
          "B987jRxFFnSBULwu6cXRKzUfKDDpyuhCGC58wVxct6Ez"
        );
        const recentTransactions = await fetchRecentTransactions(
          publicKey,
          provider
        );

        //
        // Get the recent blockhash for transaction construction.
        //
        const { blockhash } = await provider.connection.getLatestBlockhash(
          commitment
        );

        //
        // Done.
        //
        return {
          splTokenAccounts: removeNfts(splTokenAccounts, splNftMetadata),
          splTokenMetadata,
          splNftMetadata,
          coingeckoData,
          recentTransactions,
          recentBlockhash: blockhash,
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

export function removeNfts(
  splTokenAccounts: Map<string, TokenAccountWithKey>,
  splNftMetadata: Map<string, any>
): Map<string, TokenAccountWithKey> {
  // @ts-ignore
  for (let key of splNftMetadata.keys()) {
    splTokenAccounts.delete(key);
  }
  return splTokenAccounts;
}
