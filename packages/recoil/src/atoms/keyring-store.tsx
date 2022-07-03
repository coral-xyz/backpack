import { atom, selector } from "recoil";
import {
  UI_RPC_METHOD_KEYRING_STORE_STATE,
  UI_RPC_METHOD_APPROVED_ORIGINS_READ,
} from "@coral-xyz/common";
import { backgroundClient } from "./background";

export type KeyringStoreState = "locked" | "unlocked" | "needs-onboarding";

export const KeyringStoreStateEnum: { [key: string]: KeyringStoreState } = {
  Locked: "locked",
  Unlocked: "unlocked",
  NeedsOnboarding: "needs-onboarding",
};

/**
 * Status of the keyring store.
 */
export const keyringStoreState = atom<KeyringStoreState | null>({
  key: "keyringStoreState",
  default: selector({
    key: "keyringStoreStateDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_STATE,
        params: [],
      });
    },
  }),
});

export const approvedOrigins = atom<Array<string> | null>({
  key: "approvedOrigins",
  default: null,
  effects: [
    ({ setSelf, getPromise }) => {
      setSelf(
        (async () => {
          const background = await getPromise(backgroundClient);
          return await background.request({
            method: UI_RPC_METHOD_APPROVED_ORIGINS_READ,
            params: [],
          });
        })()
      );
    },
  ],
});
