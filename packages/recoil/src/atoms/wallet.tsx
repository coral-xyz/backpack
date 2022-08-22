import { atom, selector, selectorFamily } from "recoil";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLETS,
} from "@coral-xyz/common";
import { WalletPublicKeys } from "../types";
import { backgroundClient } from "./client";

/**
 * Pubkey of the currently selected wallet.
 */
export const activeWallet = atom<string | null>({
  key: "activeWallet",
  default: selector({
    key: "activeWalletDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET,
        params: [],
      });
    },
  }),
});

export const walletWithData = selectorFamily({
  key: "walletWithData",
  get:
    (publicKey: string) =>
    ({ get }) => {
      const publicKeys = get(walletPublicKeys);
      for (const [blockchain, keyring] of Object.entries(publicKeys)) {
        for (const namedPublicKeys of Object.values(keyring)) {
          for (const namedPublicKey of namedPublicKeys) {
            if (namedPublicKey.publicKey === publicKey)
              return {
                ...namedPublicKey,
                blockchain: blockchain as Blockchain,
              };
          }
        }
      }
      return undefined;
    },
});

/**
 * Currently selected wallet with name and blockchain.
 */
export const activeWalletWithData = selector({
  key: "activeWalletWithData",
  get: ({ get }) => {
    const activePublicKey = get(activeWallet);
    return activePublicKey ? get(walletWithData(activePublicKey)) : undefined;
  },
});

/**
 * Pubkey of the currently selected wallet for each blockchain.
 */
export const activeWallets = atom<string[]>({
  key: "activeWallets",
  default: selector({
    key: "activeWalletsDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLETS,
        params: [],
      });
    },
  }),
});

/**
 *  Active wallet for each blockchain with name and blockchain.
 */
export const activeWalletsWithData = selector({
  key: "activeWalletsWithData",
  get: ({ get }) => {
    return get(activeWallets).map(
      (publicKey) => get(walletWithData(publicKey)!)!
    );
  },
});

/**
 * List of all public keys for the wallet along with associated nicknames.
 */
export const walletPublicKeys = atom<WalletPublicKeys>({
  key: "walletPublicKeys",
  default: selector({
    key: "walletPublicKeysDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
        params: [],
      });
    },
  }),
});
