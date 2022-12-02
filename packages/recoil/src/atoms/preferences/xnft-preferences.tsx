import { atom, selector, selectorFamily } from "recoil";
import {
  UI_RPC_METHOD_GET_XNFT_PREFERENCES,
  XnftPreferenceStore,
  XnftPreference,
} from "@coral-xyz/common";
import { backgroundClient } from "../client";

export const xnftPreferences = atom<XnftPreferenceStore>({
  key: "xnftPreferences",
  default: selector({
    key: "xnftPreferencesDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      const response = await background.request({
        method: UI_RPC_METHOD_GET_XNFT_PREFERENCES,
        params: [],
      });
      return response || {};
    },
  }),
});

export const xnftPreference = selectorFamily<
  XnftPreference,
  {
    xnftId: string;
  }
>({
  key: "xnftPreference",
  get:
    ({ xnftId }: { xnftId: string }) =>
    async ({ get }) => {
      const preferences = get(xnftPreferences);
      return preferences[xnftId] || {};
    },
});
