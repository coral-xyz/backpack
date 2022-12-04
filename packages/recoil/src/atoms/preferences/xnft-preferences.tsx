import type { XnftPreference, XnftPreferenceStore } from "@coral-xyz/common";
import { UI_RPC_METHOD_GET_XNFT_PREFERENCES } from "@coral-xyz/common";
import { atom, selector, selectorFamily } from "recoil";

import { backgroundClient } from "../client";

type xNftId = string;
export const xnftPreferences = atom<XnftPreferenceStore | null>({
  key: "xnftPreferences",
  default: selector({
    key: "xnftPreferencesDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      const response = await background.request({
        method: UI_RPC_METHOD_GET_XNFT_PREFERENCES,
        params: [],
      });
      return response ?? null;
    },
  }),
});

export const xnftPreference = selectorFamily<
  XnftPreference | null,
  xNftId | undefined
>({
  key: "xnftPreference",
  get:
    (xnftId) =>
    async ({ get }) => {
      if (!xnftId) {
        return null;
      }
      const preferences = get(xnftPreferences);
      return preferences?.[xnftId] ?? null;
    },
});
