import { atom, selector, selectorFamily } from "recoil";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLETS,
} from "@coral-xyz/common";
import { WalletPublicKeys } from "../types";
import { backgroundClient } from "./client";
import { enabledBlockchains } from "./blockchain";

/**
 * Augment a public key with the name and blockchain and return as an object.
 */
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
 * Pubkey of the currently selected wallet for each blockchain.
 */
export const activeWallets = atom<string[]>({
  key: "activeWallets",
  default: selector({
    key: "activeWalletsDefault",
    get: ({ get }) => {
      // Enabled blockchains as a dependency to reload if they change
      get(enabledBlockchains);
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLETS,
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
 * Object mapping blockchain => publicKey.
 */
export const activePublicKeys = selector({
  key: "activePublicKeys",
  get: ({ get }) => {
    return Object.fromEntries(
      get(activeWalletsWithData).map((w) => [w.blockchain, w.publicKey])
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
    get: ({ get }) => {
      // Enabled blockchains as a dependency to reload if they change
      get(enabledBlockchains);
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
        params: [],
      });
    },
  }),
});

export const activeEthereumWallet = selector({
  key: "activeEthereumWallet",
  get: ({ get }) => {
    const activeWallets = get(activeWalletsWithData);
    return activeWallets.find(
      (w: any) => w!.blockchain === Blockchain.ETHEREUM
    );
  },
});

export const ethereumPublicKey = selector({
  key: "ethereumPublicKey",
  get: ({ get }) => {
    return get(activeEthereumWallet)?.publicKey ?? null;
  },
});

export const activeSolanaWallet = selector({
  key: "ethereumWallet",
  get: ({ get }) => {
    const activeWallets = get(activeWalletsWithData);
    return activeWallets.find((w: any) => w!.blockchain === Blockchain.SOLANA);
  },
});

export const solanaPublicKey = selector({
  key: "solanaPublicKey",
  get: ({ get }) => {
    return get(activeSolanaWallet)?.publicKey ?? null;
  },
});
