import type { ServerPublicKey } from "@coral-xyz/common";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEY_DATA,
} from "@coral-xyz/common";
import { atom, selector, selectorFamily } from "recoil";

import type { PublicKeyMetadata, Wallet, WalletPublicKeys } from "../types";

import { backgroundClient } from "./client";
import { isAggregateWallets } from "./preferences";

/**
 * All public key data associated with the currently active username.
 * All the other pieces of wallet data are derived via selectors from this atom.
 */
export const walletPublicKeyData = atom<{
  activeBlockchain: Blockchain;
  activePublicKeys: Array<string>;
  publicKeys: WalletPublicKeys;
}>({
  key: "walletPublicKeyData",
  default: selector({
    key: "walletPublicKeyDataDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      const resp = await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEY_DATA,
        params: [],
      });
      return resp;
    },
  }),
});

export const availableBlockchains = atom({
  key: "blockchains",
  default: [Blockchain.SOLANA, Blockchain.ETHEREUM],
});

export const enabledBlockchains = selector({
  key: "enabledBlockchains",
  get: ({ get }) => {
    const data = get(walletPublicKeyData);
    return Object.keys(data.publicKeys);
  },
});

export const activeBlockchain = selector<Blockchain>({
  key: "activeBlockchain",
  get: ({ get }) => {
    const data = get(walletPublicKeyData);
    return data.activeBlockchain;
  },
});

export const isKeyCold = selectorFamily<boolean, string>({
  key: "isKeyCold",
  get:
    (publicKey) =>
    ({ get }) => {
      const wallets = get(allWallets);
      const w = wallets.find((w) => w.publicKey === publicKey)!;
      if (!w) {
        return false;
      }
      const { isCold } = w;
      return isCold ?? false;
    },
});

// All wallets enabled in the wallet. The assets for each wallet may or may
// not be displayed in the balance view depending on the aggregate wallets
// setting.
export const allWallets = selector<Wallet[]>({
  key: "allWallets",
  get: ({ get }) => {
    return get(enabledBlockchains)
      .map((b) => get(allWalletsPerBlockchain(b as Blockchain)))
      .flat();
  },
});

// All wallets displayed in the balance view.
export const allWalletsDisplayed = selector<Wallet[]>({
  key: "allWalletsDisplayed",
  get: ({ get }) => {
    const _isAggregateWallets = get(isAggregateWallets);
    if (_isAggregateWallets) {
      return get(allWallets);
    } else {
      return [get(activeWallet)];
    }
  },
});

export const allWalletsPerBlockchain = selectorFamily<Wallet[], Blockchain>({
  key: "allWalletsPerBlockchain",
  get:
    (blockchain) =>
    ({ get }) => {
      const keyrings = get(walletPublicKeys);
      const keyring = keyrings[blockchain]!;
      const result = keyring.hdPublicKeys
        .map((k: PublicKeyMetadata) => ({
          ...k,
          blockchain,
          type: "derived",
          isCold: k.isCold ?? false,
        }))
        .concat(
          keyring.importedPublicKeys.map((k: PublicKeyMetadata) => ({
            ...k,
            blockchain,
            type: "imported",
            isCold: k.isCold ?? false,
          }))
        )
        .concat(
          keyring.ledgerPublicKeys.map((k: PublicKeyMetadata) => ({
            ...k,
            blockchain,
            type: "hardware",
            isCold: k.isCold ?? true,
          }))
        );

      return result;
    },
});

export const activeWallet = selector<Wallet>({
  key: "activeWallet",
  get: ({ get }) => {
    const data = get(walletPublicKeyData);

    //
    // Get all the pubkeys for the active blockchain.
    //
    const { ledgerPublicKeys, importedPublicKeys, hdPublicKeys } =
      data.publicKeys[data.activeBlockchain];

    //
    // Pluck out the currently active wallet for that blockchain.
    //
    const wallet = hdPublicKeys
      .map((k) => ({ ...k, type: "derived" }))
      .concat(ledgerPublicKeys.map((k) => ({ ...k, type: "hardware" })))
      .concat(importedPublicKeys.map((k) => ({ ...k, type: "imported" })))
      .find((pk) => data.activePublicKeys.indexOf(pk.publicKey) >= 0);

    if (!wallet) {
      throw new Error("active wallet not found");
    }

    return {
      blockchain: data.activeBlockchain,
      ...wallet,
    };
  },
});

/**
 * Pubkey of the currently selected wallet for each blockchain.
 */
export const activeWallets = selector<Array<string>>({
  key: "activeWalletsDefault",
  get: ({ get }) => {
    const data = get(walletPublicKeyData);
    return data.activePublicKeys;
  },
});

/**
 * List of all public keys for the wallet along with associated nicknames.
 */
export const walletPublicKeys = selector<WalletPublicKeys>({
  key: "walletPublicKeys",
  get: ({ get }) => {
    const data = get(walletPublicKeyData);
    return data.publicKeys;
  },
});

/**
 * List of public keys that exist on the Backpack API for the current account
 */
export const serverPublicKeys = atom<Array<ServerPublicKey>>({
  key: "serverPublicKeys",
  default: [],
});

/**
 * List of public keys that exist on the Backpack API that there is not a corresponding
 * local wallet/signing mechanism for, e.g. no private key.
 */
export const dehydratedWallets = selector<Array<ServerPublicKey>>({
  key: "dehydratedWallets",
  get: ({ get }) => {
    return get(serverPublicKeys).filter(
      (s) =>
        !get(allWallets).find(
          (a) => a.blockchain === s.blockchain && a.publicKey === s.publicKey
        )
    );
  },
});

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
 *  Active wallet for each blockchain with name and blockchain.
 */
export const activeWalletsWithData = selector({
  key: "activeWalletsWithData",
  get: ({ get }) => {
    const _activeWallets = get(activeWallets);
    return _activeWallets.map((publicKey) => get(walletWithData(publicKey)!)!);
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

export const activeEthereumWallet = selector({
  key: "activeEthereumWallet",
  get: ({ get }) => {
    const activeWallets = get(activeWalletsWithData);
    return activeWallets.find(
      (w: any) => w!.blockchain === Blockchain.ETHEREUM
    );
  },
});

export const ethereumPublicKey = selector<string | null>({
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

export const solanaPublicKey = selector<string | null>({
  key: "solanaPublicKey",
  get: ({ get }) => {
    return get(activeSolanaWallet)?.publicKey ?? null;
  },
});
