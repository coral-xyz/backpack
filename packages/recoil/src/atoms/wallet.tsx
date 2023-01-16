import {
  Blockchain,
  getLogger,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEY_DATA,
} from "@coral-xyz/common";
import { atom, selector, selectorFamily } from "recoil";

import type { WalletPublicKeys } from "../types";

import { backgroundClient } from "./client";
import { enabledBlockchains, isAggregateWallets } from "./preferences";

// write a function that returns the current date seconds and milliseconds
function gcd() {
  const date = new Date();
  return date.getSeconds() + "." + date.getMilliseconds();
}

/**
 * All public key data associated with the currently active username.
 * All the other pieces of wallet data are derived via selectors from this atom.
 */
const logger = getLogger("KKKKKK");

// const d = {
//   activeBlockchain: "solana",
//   publicKeys: {
//     solana: {
//       hdPublicKeys: [
//         {
//           publicKey: "FqPKAh6YFPydPznQxfmSgWmzVKZYGdaj5aCSNcnh6ces",
//           name: "Wallet 1",
//         },
//       ],
//       importedPublicKeys: [],
//       ledgerPublicKeys: [],
//     },
//   },
// };

// TODO(peter): these need to return back some sort of sane defaults like you see before, but async
// a combination of atom + selector? or just selector? either way, we're getting an issue where a selector downchian can't read ledgerPublicKeys because publicKeys is null, which is a problem
export const walletPublicKeyData = atom<{
  activeBlockchain: Blockchain;
  activePublicKeys: string[];
  publicKeys: WalletPublicKeys;
}>({
  key: "walletPublicKeyData",
  default: {
    activeBlockchain: Blockchain.SOLANA,
    activePublicKeys: ["FqPKAh6YFPydPznQxfmSgWmzVKZYGdaj5aCSNcnh6ces"],
    publicKeys: {
      [Blockchain.SOLANA]: {
        hdPublicKeys: [
          {
            publicKey: "FqPKAh6YFPydPznQxfmSgWmzVKZYGdaj5aCSNcnh6ces",
            name: "Wallet 1",
          },
        ],
        importedPublicKeys: [],
        ledgerPublicKeys: [],
      },
    },
  },
  // effects: [
  //   ({ setSelf }) => {
  //     return setSelf({
  //       activeBlockchain: Blockchain.SOLANA,
  //       activePublicKeys: [],
  //       publicKeys: {},
  //     });
  //   },
  // ],
  // default: selector({
  //   key: "walletPublicKeyDataDefault",
  //   get: async ({ get }) => {
  //     const background = get(backgroundClient);
  //     try {
  //       const result = await background.request({
  //         method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEY_DATA,
  //         params: [],
  //       });
  //       logger.debug("atom.walletPublicKeyData result", result);
  //       return result;
  //     } catch (error) {
  //       logger.debug("atom.walletPublicKeyDatae error", error);
  //       return {};
  //     }
  //   },
  // }),
});

export const activeBlockchain = selector<Blockchain>({
  key: "activeBlockchain",
  get: ({ get }) => {
    const data = get(walletPublicKeyData);
    return data.activeBlockchain;
  },
});

// All wallets enabled in the wallet. Not necessarily shown by the UI.
export const allWallets = selector<
  Array<{
    name: string;
    type: string;
    publicKey: string;
    blockchain: Blockchain;
  }>
>({
  key: "allWallets",
  get: ({ get }) => {
    const _enabledBlockchains = get(enabledBlockchains);
    let wallets: Array<any> = [];

    if (_enabledBlockchains.includes(Blockchain.SOLANA)) {
      const solanaWallets = get(allWalletsPerBlockchain(Blockchain.SOLANA));
      wallets = wallets.concat(solanaWallets);
    }
    if (_enabledBlockchains.includes(Blockchain.ETHEREUM)) {
      const ethereumWallets = get(allWalletsPerBlockchain(Blockchain.ETHEREUM));
      wallets = wallets.concat(ethereumWallets);
    }

    return wallets;
  },
});

// All wallets to display in the UI at any given time.
export const allWalletsDisplayed = selector<
  Array<{
    name: string;
    type: string;
    publicKey: string;
    blockchain: Blockchain;
  }>
>({
  key: "allWalletsDisplayed",
  get: ({ get }) => {
    try {
      const _isAggregateWallets = get(isAggregateWallets);
      logger.debug(
        "atom.allWalletsDisplayed:_isAggregateWallets",
        _isAggregateWallets
      );
      if (_isAggregateWallets) {
        logger.debug("atom.allWalletsDisplayed:_isAggregateWallets");
        return get(allWallets);
      } else {
        const res = get(activeWallet);
        logger.debug("atom.allWalletsDisplayed:activeWallet", res);
        return [res];
      }
    } catch (error) {
      logger.debug("atom.allWalletsDisplayed:error", error, gcd());
      return [];
    }
  },
});

export const allWalletsPerBlockchain = selectorFamily<
  Array<{
    name: string;
    type: string;
    publicKey: string;
    blockchain: Blockchain;
  }>,
  Blockchain
>({
  key: "allWalletsPerBlockchain",
  get:
    (blockchain) =>
    ({ get }) => {
      const keyrings = get(walletPublicKeys);
      const keyring = keyrings[blockchain]!;
      return keyring.hdPublicKeys
        .map((k: any) => ({ ...k, blockchain, type: "derived" }))
        .concat(
          keyring.importedPublicKeys.map((k: any) => ({
            ...k,
            type: "imported",
            blockchain,
          }))
        )
        .concat(
          keyring.ledgerPublicKeys.map((k: any) => ({
            ...k,
            blockchain,
            type: "hardware",
          }))
        );
    },
});

export const activeWallet = selector<{
  publicKey: string;
  name: string;
  blockchain: Blockchain;
  type: string;
}>({
  key: "activeWallet",
  get: async ({ get }) => {
    try {
      logger.debug("atom.activeWallet data:pre");
      const data = get(walletPublicKeyData);
      logger.debug("atom.activeWallet data:post", data);

      logger.debug(
        "atom.activeWallet data.activeBlockchain",
        data.activeBlockchain
      );
      logger.debug("atom.activeWallet data.publicKeys", data.publicKeys);

      const keyring = data.publicKeys[data.activeBlockchain]!;
      logger.debug("atom.activeWallet data.keyring", keyring);

      if (!keyring) {
        logger.debug("atom.activeWallet NO KEYRING");
        throw new Error(
          'No keyring for active blockchain "' + data.activeBlockchain + '"'
        );
      }

      logger.debug("atom.activeWallet BEFORE ledgerPublicKeys etc");

      //
      // Get all the pubkeys for the active blockchain.
      //
      const { ledgerPublicKeys, importedPublicKeys, hdPublicKeys } =
        data.publicKeys[data.activeBlockchain];

      logger.debug("atom.activeWallet data ledgerPublicKeys etc", data);

      //
      // Pluck out the currently active wallet for that blockchain.
      //
      const wallet = hdPublicKeys
        .map((k) => ({ ...k, type: "derived" }))
        .concat(ledgerPublicKeys.map((k) => ({ ...k, type: "hardware" })))
        .concat(importedPublicKeys.map((k) => ({ ...k, type: "imported" })))
        .find((pk) => data.activePublicKeys.indexOf(pk.publicKey) >= 0);

      logger.debug("atom.activeWallet BEFORE wallet");

      if (!wallet) {
        logger.debug("atom.activeWallet no wallet found");
        throw new Error("active wallet not found");
      }

      logger.debug("atom.activeWallet data:wallet", wallet);

      const res = {
        blockchain: data.activeBlockchain,
        ...wallet,
      };

      logger.debug("atom.activeWallet res", res);

      return res;
    } catch (error) {
      logger.debug("atom.activeWallet data error", error);
      return {
        publicKey: "",
        name: "",
        blockchain: Blockchain.SOLANA,
        type: "",
      };
    }
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
