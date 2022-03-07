import { atom, atomFamily } from "recoil";
import { TokenAccountWithKey } from "./types";
import {
  UI_RPC_METHOD_CONNECTION_URL_READ,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
} from "../common";
import { getBackgroundClient } from "../background/client";

/**
 * store the info from the SPL Token Account owned by
 * the connected wallet.
 */
export const tokenAccountsMap = atomFamily<TokenAccountWithKey | null, string>({
  key: "tokenAccountsMap",
  default: null,
});

/**
 * list of all stored token accounts within tokenAccountsMap.
 */
export const tokenAccountKeys = atom<string[]>({
  key: "tokenAccountKeys",
  default: [],
});

export const walletPublicKeys = atom<string[]>({
  key: "walletPublicKeys",
  default: [],
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
          params: [],
        })
      );
    },
  ],
});

/**
 * URL to the cluster to communicate with.
 */
const DEFAULT_CONNECTION_URL = "https://solana-api.projectserum.com";
export const connectionUrlAtom = atom<string>({
  key: "clusterConnection",
  default: DEFAULT_CONNECTION_URL,
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background
          .request({
            method: UI_RPC_METHOD_CONNECTION_URL_READ,
            params: [],
          })
          .then((result) => result ?? DEFAULT_CONNECTION_URL)
      );
    },
    ({ onSet }) => {
      onSet((cluster) => {
        const background = getBackgroundClient();
        background
          .request({
            method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
            params: [cluster],
          })
          .catch(console.error);
      });
    },
  ],
});
