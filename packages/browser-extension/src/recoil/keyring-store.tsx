import { atom } from "recoil";
import {
  UI_RPC_METHOD_KEYRING_STORE_STATE,
  UI_RPC_METHOD_APPROVED_ORIGINS_READ,
} from "../common";
import { getBackgroundClient } from "../background/client";
import { KeyringStoreState } from "../keyring/store";

/**
 * Status of the keyring store.
 */
export const keyringStoreState = atom<KeyringStoreState | null>({
  key: "keyringStoreState",
  default: null,
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_STATE,
          params: [],
        })
      );
    },
  ],
});

export const approvedOrigins = atom<Array<string> | null>({
  key: "approvedOrigins",
  default: null,
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_APPROVED_ORIGINS_READ,
          params: [],
        })
      );
    },
  ],
});
