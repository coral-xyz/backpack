import type {
  AutolockSettings,
  Blockchain,
  Preferences,
} from "@coral-xyz/common";
import { DEFAULT_AUTO_LOCK_INTERVAL_SECS } from "@coral-xyz/secure-background/legacyCommon";
import type { User } from "@coral-xyz/secure-background/types";
import type { Commitment } from "@solana/web3.js";
import { atom, selector, selectorFamily } from "recoil";

import {
  _secureOnboardedUserAtom,
  _secureOnboardedUserAtomNullable,
  enabledBlockchainsAtom,
  secureAllUsersAtom,
  secureAllUsersAtomNullable,
} from "../secure-client";

export const preferences = selector<Preferences>({
  key: "preferences",
  get: async ({ get }) => {
    // use _secureOnboardedUserAtom here so preferences can be used before migration
    const user = get(_secureOnboardedUserAtom);
    return user.preferences;
  },
});

export const preferencesNullable = selector<Preferences | null>({
  key: "preferencesNullable",
  get: async ({ get }) => {
    // use _secureOnboardedUserAtomNullable here so preferences can be used before migration
    const user = get(_secureOnboardedUserAtomNullable);
    return user?.preferences ?? null;
  },
});

export const isDarkMode = selector<boolean>({
  key: "isDarkMode",
  get: async () => {
    // Force dark mode on mobile, light mode in extension
    return true;
  },
});

export const isDeveloperMode = selector<boolean>({
  key: "isDeveloperMode",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.developerMode;
  },
});

export const autoLockSettings = selector<AutolockSettings>({
  key: "autoLockSettings",
  get: async ({ get }) => {
    const p = get(preferences);
    return (
      p.autoLockSettings || {
        seconds: p.autoLockSecs || DEFAULT_AUTO_LOCK_INTERVAL_SECS,
        option: undefined,
      }
    );
  },
});

export const isAggregateWallets = selector<boolean>({
  key: "isAggregateWallets",
  get: async ({ get }) => {
    const p = get(preferences);
    return Boolean(p.aggregateWallets);
  },
});

export const isLockAvatarFullScreen = selector<boolean>({
  key: "isLockAvatarFullScreen",
  get: async ({ get }) => {
    const p = get(preferences);
    return !!p.isLockAvatarFullScreen;
  },
});

export const approvedOrigins = selector<Array<string>>({
  key: "approvedOrigins",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.approvedOrigins;
  },
});

// This is the *active* username.
export const user = atom<User>({
  key: "user",
  default: selector({
    key: "userDefault",
    get: async ({ get }) => {
      const user = get(_secureOnboardedUserAtom);
      return user.user;
    },
  }),
});
export const userNullable = atom<User | null>({
  key: "userNullable",
  default: selector({
    key: "userDefaultNullable",
    get: ({ get }) => {
      const user = get(_secureOnboardedUserAtomNullable);
      if (user?.user) {
        return user.user;
      } else {
        return null;
      }
    },
  }),
});

export const allUsers = secureAllUsersAtom;
export const allUsersNullable = secureAllUsersAtomNullable;

export const blockchainExplorer = selectorFamily<string, Blockchain>({
  key: "blockchainExplorer",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const p = get(preferences);
      return p.blockchains[blockchain].explorer;
    },
});

export const blockchainConnectionUrl = selectorFamily<string, Blockchain>({
  key: "blockchainConnectionUrl",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const p = get(preferences);
      return p.blockchains[blockchain].connectionUrl;
    },
});

export const blockchainConnectionUrlNullable = selectorFamily<
  string | null,
  Blockchain
>({
  key: "blockchainConnectionUrlNullable",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const p = get(preferencesNullable);
      return p?.blockchains[blockchain].connectionUrl ?? null;
    },
});

export const blockchainChainId = selectorFamily<string | undefined, Blockchain>(
  {
    key: "blockchainChainId",
    get:
      (blockchain: Blockchain) =>
      ({ get }) => {
        const p = get(preferences);
        return p.blockchains[blockchain].chainId;
      },
  }
);

export const blockchainCommitment = selectorFamily<
  Commitment | undefined,
  Blockchain
>({
  key: "blockchainCommitment",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const p = get(preferences);
      return p.blockchains[blockchain].commitment;
    },
});

export const hiddenTokenAddresses = selectorFamily<string[], Blockchain>({
  key: "hiddenTokenAddresses",
  get:
    (blockchain: Blockchain) =>
    ({ get }) => {
      const p = get(preferences);
      return p.hiddenTokenAddresses?.[blockchain] ?? [];
    },
});

export const allBlockchainConnectionUrls = atom<{
  [key: string]: string | null;
}>({
  key: "connectionUrls",
  default: selector({
    key: "connectionUrlsDefault",
    get: async ({ get }) => {
      const enabledBlockchains = get(enabledBlockchainsAtom);
      return Object.fromEntries(
        new Map(
          enabledBlockchains.map((blockchain) => {
            return [
              blockchain,
              get(blockchainConnectionUrl(blockchain as Blockchain)),
            ];
          })
        )
      );
    },
  }),
});

export * from "./xnft-preferences";
