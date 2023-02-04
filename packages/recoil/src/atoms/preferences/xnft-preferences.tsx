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

      const result: XnftPreferenceStore = {
        // Set default pushNotification permissions for ONE xNFT
        "4ekUZj2TKNoyCwnRDstvViCZYkhnhNoWNQpa5bBLwhq4": {
          disabled: false,
          pushNotifications: true,
          mediaPermissions: false,
        },
        // And for the Dropzone xNFT
        CVkbt7dscJdjAJFF2uKrtin6ve9M8DA4gsUccAjePUHH: {
          disabled: false,
          pushNotifications: true,
          mediaPermissions: false,
        },
        ...(response ?? null),
      };

      return result;
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
