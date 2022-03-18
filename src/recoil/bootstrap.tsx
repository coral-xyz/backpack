import { atom, selector } from "recoil";
import { PublicKey } from "@solana/web3.js";
import { TokenAccountWithKey } from "./types";
import { UI_RPC_METHOD_NAVIGATION_READ } from "../common";
import { getBackgroundClient } from "../background/client";
import { TABS } from "../background/backend";
import { fetchRecentTransactions } from "./recent-transactions";
import { solanaWallet, anchorContext } from "./wallet";
import {
  splTokenRegistry,
  fetchTokens,
  fetchSplMetadata,
  fetchSplMetadataUri,
} from "./token";
import { fetchPriceData } from "./price-data";

/**
 * Defines the initial app load fetch.
 */
export const bootstrap = atom<any>({
  key: "bootstrap",
  default: selector({
    key: "bootstrapSelector",
    get: async ({ get }: any) => {
      const tokenRegistry = get(splTokenRegistry);
      const wallet = get(solanaWallet);
      const { provider, tokenClient } = get(anchorContext);

      //
      // Perform data fetch.
      //
      try {
        //
        // Fetch the SPL tokens.
        //
        const splTokenAccounts = await fetchTokens(wallet, tokenClient);
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
        // Done.
        //
        return {
          splTokenAccounts: removeNfts(splTokenAccounts, splNftMetadata),
          splTokenMetadata,
          splNftMetadata,
          coingeckoData,
          recentTransactions,
          walletPublicKey: wallet.publicKey,
        };
      } catch (err) {
        // TODO: show error notification.
        console.error(err);
      }
    },
  }),
});

// Version of bootstrap for very fast data on load. This shouldn't block the load
// in any discernable way.
export const bootstrapFast = atom<any>({
  key: "bootstrapFast",
  default: selector({
    key: "bootstrapFastSelector",
    get: async ({ get }: any) => {
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
      return {
        tabs,
      };
    },
  }),
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
