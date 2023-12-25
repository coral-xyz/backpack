import type { XnftPreference, XnftPreferenceStore } from "@coral-xyz/common";
import { UI_RPC_METHOD_GET_XNFT_PREFERENCES } from "@coral-xyz/common";
import { atomFamily, selectorFamily } from "recoil";

import { backgroundClient } from "../client";
import { secureUserAtom } from "../secure-client";

type xNftId = string;
export const xnftPreferences = atomFamily<
  XnftPreferenceStore | null,
  string | null | undefined
>({
  key: "xnftPreferences",
  default: selectorFamily({
    key: "xnftPreferencesDefault",
    get:
      (uuid) =>
      async ({ get }) => {
        if (!uuid) {
          return null;
        }
        const background = get(backgroundClient);
        const response = await background.request({
          method: UI_RPC_METHOD_GET_XNFT_PREFERENCES,
          params: [uuid],
        });

        const result: XnftPreferenceStore = {
          // Set default pushNotification permissions for ONE xNFT
          "4ekUZj2TKNoyCwnRDstvViCZYkhnhNoWNQpa5bBLwhq4": {
            disabled: false,
            pushNotifications: false,
            mediaPermissions: false,
          },
          // And for the Dropzone xNFT
          CVkbt7dscJdjAJFF2uKrtin6ve9M8DA4gsUccAjePUHH: {
            disabled: false,
            pushNotifications: false,
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
      const activeUser = get(secureUserAtom);
      const preferences = get(xnftPreferences(activeUser.user.uuid));
      return preferences?.[xnftId] ?? null;
    },
});
