import { Blockchain } from "@coral-xyz/common";
import type { EthereumClient, SolanaClient } from "@coral-xyz/secure-clients";
import {
  createBlockchainClient,
  getBlockchainConfig,
  getEnabledBlockchainConfigs,
} from "@coral-xyz/secure-clients";
import type {
  BlockchainClient,
  BlockchainConfig,
} from "@coral-xyz/secure-clients/types";
import { selector, selectorFamily } from "recoil";

import { secureBackgroundSenderAtom } from "./transportAtoms";
import { secureUserAtom, secureUserAtomNullable } from "./userClientAtoms";

export const blockchainConfigAtom = selectorFamily<
  BlockchainConfig,
  Blockchain
>({
  key: "blockchainConfigAtom",
  get:
    (blockchain) =>
    ({ get }) => {
      const config = getBlockchainConfig(blockchain);
      if (!config) {
        throw new Error("Unkown Blockchain: " + blockchain);
      }
      return config;
    },
});

export const enabledBlockchainsAtom = selector<Blockchain[]>({
  key: "enabledBlockchainsAtom",
  get: ({ get }) => {
    return Object.keys(get(enabledBlockchainConfigsAtom)) as Blockchain[];
  },
});

export const enabledBlockchainConfigsAtom = selector<
  Partial<Record<Blockchain, BlockchainConfig>>
>({
  key: "enabledBlockchainConfigsAtom",
  get: () => {
    return getEnabledBlockchainConfigs();
  },
});

export const blockchainClientAtom = selectorFamily<
  BlockchainClient<Blockchain>,
  Blockchain
>({
  key: "blockchainClientAtom",
  get:
    (blockchain) =>
    ({ get }) => {
      const secureBackgroundSender = get(secureBackgroundSenderAtom);
      const user = get(secureUserAtomNullable);
      return createBlockchainClient(
        blockchain,
        secureBackgroundSender,
        user ?? undefined
      );
    },
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

export const ethereumClientAtom = selector<EthereumClient | null>({
  key: "ethereumClientAtom",
  get: ({ get }) => {
    const secureBackgroundSender = get(secureBackgroundSenderAtom);
    const user = get(secureUserAtom);
    return createBlockchainClient(
      Blockchain.ETHEREUM,
      secureBackgroundSender,
      user
    );
  },
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});

export const solanaClientAtom = selector<SolanaClient>({
  key: "solanaClientAtom",
  get: ({ get }) => {
    const secureBackgroundSender = get(secureBackgroundSenderAtom);
    const user = get(secureUserAtom);
    return createBlockchainClient(
      Blockchain.SOLANA,
      secureBackgroundSender,
      user
    );
  },
  // this prevents recoil from freezing the object in dev mode
  // required to keep the transport working.
  dangerouslyAllowMutability: true,
});
