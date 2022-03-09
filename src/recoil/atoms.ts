import { atom, atomFamily, selector } from "recoil";
import { TokenAccountWithKey } from "./types";
import {
  UI_RPC_METHOD_CONNECTION_URL_READ,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
  UI_RPC_METHOD_KEYRING_STORE_STATE,
} from "../common";
import { getBackgroundClient } from "../background/client";
import { WalletPublicKeys } from "./types";
import { KeyringStoreState } from "../keyring/store";

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

/**
 * List of all public keys for the wallet along with associated nicknames.
 */
export const walletPublicKeys = atom<WalletPublicKeys>({
  key: "walletPublicKeys",
  default: { hdPublicKeys: [], importedPublicKeys: [] },
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
 * Pubkey of the currently selected wallet.
 */
export const activeWallet = atom<string | null>({
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
 * Currently selected wallet with display data.
 */
export const activeWalletWithName = selector({
  key: "filteredTodoListState",
  get: ({ get }) => {
    const active = get(activeWallet);
    const pks = get(walletPublicKeys);
    let result = pks.hdPublicKeys.find(
      (pk) => pk.publicKey.toString() === active
    );
    if (result) {
      return result;
    }
    result = pks.importedPublicKeys.find(
      (pk) => pk.publicKey.toString() === active
    );

    return result;
  },
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
        // TODO: do we want to handle this via notification instead?
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
