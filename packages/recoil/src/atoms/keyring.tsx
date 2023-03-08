import {
  UI_RPC_METHOD_KEYRING_HAS_MNEMONIC,
  UI_RPC_METHOD_KEYRING_STORE_STATE,
} from "@coral-xyz/common";
import { atom, selector } from "recoil";

import { user } from "../atoms/preferences";

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
 * Whether the users keyring has a mnemonic configured.
 */
export const keyringHasMnemonic = atom<boolean>({
  key: "keyringHasMnemonic",
  default: selector({
    key: "keyringHasMnemonicDefault",
    get: ({ get }) => {
      // Dependent on changes to the user
      get(user);
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_KEYRING_HAS_MNEMONIC,
        params: [],
      });
    },
  }),
});
