import { Blockchain, getLogger } from "@coral-xyz/common";
import { selector, selectorFamily } from "recoil";

import type { Wallet } from "../types";

import { isAggregateWallets } from "./preferences";
import {
  enabledBlockchainsAtom,
  secureUserAtom,
  secureUserAtomNullable,
} from "./secure-client";

const logger = getLogger("atoms/wallet");

export const availableBlockchains = selector<Blockchain[]>({
  key: "blockchains",
  get: ({ get }) => {
    return get(enabledBlockchainsAtom);
  },
});

export const enabledBlockchains = selector<Blockchain[]>({
  key: "enabledBlockchains",
  get: ({ get }) => {
    const data = get(secureUserAtom);
    return Object.keys(data.publicKeys.platforms) as Blockchain[];
  },
});
export const enabledBlockchainsNullable = selector<Blockchain[] | null>({
  key: "enabledBlockchainsNullable",
  get: ({ get }) => {
    try {
      const data = get(secureUserAtom);
      return Object.keys(data.publicKeys.platforms) as Blockchain[];
    } catch (error) {
      logger.error(error);
      return null;
    }
  },
});

export const activeBlockchain = selector<Blockchain>({
  key: "activeBlockchain",
  get: ({ get }) => {
    const data = get(secureUserAtom);
    return data.publicKeys.activePlatform;
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
export const allWalletsNullable = selector<Wallet[] | null>({
  key: "allWalletsNullable",
  get: ({ get }) => {
    try {
      const enabledBlockchains = get(enabledBlockchainsNullable);
      if (enabledBlockchains) {
        return enabledBlockchains
          .map((b) => get(allWalletsPerBlockchain(b as Blockchain)))
          .flat();
      } else {
        return null;
      }
    } catch (error) {
      logger.error(error);
      return null;
    }
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
      const user = get(secureUserAtom);
      return Object.entries(
        user.publicKeys.platforms[blockchain]?.publicKeys ?? {}
      ).map(([publicKey, info]) => ({
        blockchain,
        publicKey,
        ...info,
      }));
    },
});

export const activeWallet = selector<Wallet>({
  key: "activeWallet",
  get: ({ get }) => {
    const user = get(secureUserAtom);
    const wallet = get(activeBlockchainWallet(user.publicKeys.activePlatform));
    if (!wallet) {
      throw new Error("Active wallet not found");
    }
    return wallet;
  },
});

export const activeWalletNullable = selector<Wallet | null>({
  key: "activeWalletNullable",
  get: ({ get }) => {
    const user = get(secureUserAtomNullable);
    if (!user) {
      return null;
    }

    const wallet = get(activeBlockchainWallet(user.publicKeys.activePlatform));
    return wallet;
  },
});

export const activeBlockchainWallet = selectorFamily<Wallet | null, Blockchain>(
  {
    key: "activeBlockchainWallet",
    get:
      (blockchain) =>
      ({ get }) => {
        const user = get(secureUserAtomNullable);
        if (!user) {
          return null;
        }
        const activeAccount =
          user.publicKeys.platforms[blockchain]?.activePublicKey;

        if (!activeAccount) {
          return null;
        }

        const wallet =
          user.publicKeys.platforms[blockchain]?.publicKeys[activeAccount];

        if (!wallet) {
          return null;
        }

        return {
          blockchain: blockchain,
          publicKey: activeAccount,
          ...wallet,
        };
      },
  }
);

export const blockchainWallet = selectorFamily<
  Wallet,
  { blockchain: Blockchain; publicKey: string }
>({
  key: "blockchainWallet",
  get:
    ({ blockchain, publicKey }) =>
    ({ get }) => {
      const user = get(secureUserAtom);

      const wallet =
        user.publicKeys.platforms[blockchain]?.publicKeys[publicKey];

      if (!wallet) {
        throw new Error(
          "wallet not found " + JSON.stringify({ blockchain, publicKey })
        );
      }

      return {
        blockchain,
        publicKey,
        ...wallet,
      };
    },
});

/**
 * Pubkey of the currently selected wallet for each blockchain.
 */
export const activeWallets = selector<Array<Wallet>>({
  key: "activeWalletsDefault",
  get: ({ get }) => {
    const user = get(secureUserAtom);
    return Object.entries(user.publicKeys.platforms).map(
      ([platform, accounts]) => ({
        blockchain: platform as Blockchain,
        publicKey: accounts.activePublicKey,
        ...accounts.publicKeys[accounts.activePublicKey],
      })
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
      get(activeWallets).map((w) => [w.blockchain, w.publicKey])
    );
  },
});

export const activeEthereumWallet = selector<Wallet | null>({
  key: "activeEthereumWallet",
  get: ({ get }) => {
    return get(activeBlockchainWallet(Blockchain.ETHEREUM));
  },
});

export const ethereumPublicKey = selector<string | null>({
  key: "ethereumPublicKey",
  get: ({ get }) => {
    return get(activeEthereumWallet)?.publicKey ?? null;
  },
});

export const activeSolanaWallet = selector<Wallet | null>({
  key: "solanaWallet",
  get: ({ get }) => {
    return get(activeBlockchainWallet(Blockchain.SOLANA));
  },
});

export const solanaPublicKey = selector<string | null>({
  key: "solanaPublicKey",
  get: ({ get }) => {
    return get(activeSolanaWallet)?.publicKey ?? null;
  },
});
