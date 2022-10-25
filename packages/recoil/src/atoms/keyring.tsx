import { atom, selector } from "recoil";
import {
  KeyringType,
  UI_RPC_METHOD_KEYRING_STORE_STATE,
  UI_RPC_METHOD_KEYRING_TYPE_READ,
} from "@coral-xyz/common";
import { backgroundClient } from "./client";

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

/**
 * Type of keyring, i.e. ledger of mnemonic based
 */
export const keyringType = atom<KeyringType | null>({
  key: "keyringType",
  default: selector({
    key: "keyringTypeDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_KEYRING_TYPE_READ,
        params: [],
      });
    },
  }),
});
