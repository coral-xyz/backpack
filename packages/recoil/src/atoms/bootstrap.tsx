import { UI_RPC_METHOD_NAVIGATION_READ_URL } from "@coral-xyz/common";
import { atom, selector } from "recoil";

import { backgroundClient } from "./client";

// Version of bootstrap for very fast data on load. This shouldn't block the load
// in any discernable way and can be called on initial load, regardless of the app
// being locked or unlocked.
export const bootstrapFast = atom<string>({
  key: "bootstrapFast",
  default: selector({
    key: "bootstrapFastDefault",
    get: async ({ get }) => {
      const bg = get(backgroundClient);
      const url = await bg.request({
        method: UI_RPC_METHOD_NAVIGATION_READ_URL,
        params: [],
      });
      return url;
    },
  }),
});

/**
 * This is fetched once on loading the app for the initial url redirect
 * and is otherwise ignored.
 */
export const navCurrentUrl = atom<string>({
  key: "navigationState",
  default: selector({
    key: "navigationStateDefault",
    get: ({ get }: any) => {
      return get(bootstrapFast);
    },
  }),
});
