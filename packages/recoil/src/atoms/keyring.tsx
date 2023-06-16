import {
  UI_RPC_METHOD_KEYRING_HAS_MNEMONIC,
  UI_RPC_METHOD_KEYRING_STORE_STATE,
} from "@coral-xyz/common";
import type { KeyringStoreState } from "@coral-xyz/secure-background/types";
import { atom, selector } from "recoil";

import { user } from "../atoms/preferences";

import { backgroundClient } from "./client";

export { KeyringStoreState } from "@coral-xyz/secure-background/types";

/**
 * Status of the keyring store.
 */
export const keyringStoreState = atom<KeyringStoreState | null>({
  key: "keyringStoreState",
  default: null,
  effects: [
    ({ setSelf, getPromise }) => {
      const checkState = async () => {
        const background = await getPromise(backgroundClient);
        const newState = await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_STATE,
          params: [],
        });
        setSelf(newState);
        await new Promise((resolve) => setTimeout(() => resolve(null), 5000));
        requestAnimationFrame(checkState);
      };
      checkState().catch(null);
    },
  ],
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
