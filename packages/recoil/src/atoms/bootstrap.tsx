import { atom, selector } from "recoil";
import { BigNumber } from "ethers";
import { ParsedConfirmedTransaction, PublicKey } from "@solana/web3.js";
import { fetchXnfts, UI_RPC_METHOD_NAVIGATION_READ } from "@coral-xyz/common";
import { SolanaTokenAccountWithKey } from "../types";
import { fetchPriceData } from "./prices";
import { backgroundClient } from "./client";
import { ethereumPublicKey, solanaPublicKey } from "./wallet";
import { splTokenRegistry } from "./solana/token-registry";
import { fetchJupiterRouteMap } from "./solana/jupiter";
import { ethereumTokenMetadata } from "./ethereum/token-metadata";
import { ethersContext } from "./ethereum/provider";
import { ethereumNftCollections } from "./ethereum/nft";

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
