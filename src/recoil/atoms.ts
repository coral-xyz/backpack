import { PublicKey } from "@solana/web3.js";
import { atom, atomFamily } from "recoil";
import { TokenAccountWithKey } from "./types";
import {
  UI_RPC_METHOD_CONNECTION_URL_READ,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
} from "../common";
import { getBackgroundClient } from "../background/client";
import { NamedPublicKey } from "../background/backend";

/**
 * Store the info from the SPL Token Account owned by the connected wallet.
 */
export const tokenAccountsMap = atomFamily<TokenAccountWithKey | null, string>({
  key: "tokenAccountsMap",
  default: null,
});

/**
 * List of all stored token accounts within tokenAccountsMap.
 */
export const tokenAccountKeys = atom<string[]>({
  key: "tokenAccountKeys",
  default: [],
});

/**
 * List of all public keys for the wallet along with associated nicknames.
 */
export const walletPublicKeys = atom<Array<NamedPublicKey>>({
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

export const activeWallet = atom<NamedPublicKey | null>({
  key: "activeWallet",
  default: null,
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
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
