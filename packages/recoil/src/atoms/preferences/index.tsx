import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  SolanaTokenAccountWithKeyString,
  SplNftMetadataString,
  TokenMetadataString,
  UI_RPC_METHOD_ALL_USERS_READ,
  UI_RPC_METHOD_PREFERENCES_READ,
  UI_RPC_METHOD_USER_READ,
} from "@coral-xyz/common";
import { PublicKey } from "@solana/web3.js";
import { atom, atomFamily, selector, selectorFamily } from "recoil";

import { backgroundClient } from "../client";
import { anchorContext } from "../solana";

export const preferences = atom<any>({
  key: "preferences",
  default: selector({
    key: "preferencesDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      const _user = get(user);
      return await background.request({
        method: UI_RPC_METHOD_PREFERENCES_READ,
        params: [_user.uuid],
      });
    },
  }),
});

export const enabledBlockchains = selector<Array<Blockchain>>({
  key: "enabledBlockchains",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.enabledBlockchains;
  },
});

export const isDarkMode = selector<boolean>({
  key: "isDarkMode",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.darkMode;
  },
});

export const isDeveloperMode = selector<boolean>({
  key: "isDeveloperMode",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.developerMode;
  },
});

export const autoLockSecs = selector<number>({
  key: "autoLockSecs",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.autoLockSecs;
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
export const user = atom<{ username: string; uuid: string; jwt: string }>({
  key: "user",
  default: selector({
    key: "userDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_USER_READ,
        params: [],
      });
    },
  }),
});

export const xnftJwt = atomFamily({
  key: "xnftJwt",
  default: selectorFamily({
    key: "xnftJwtDefault",
    get:
      ({ xnftAddress }: { xnftAddress: string }) =>
      async ({ get }): Promise<string> => {
        try {
          const response = await fetch(
            `${BACKEND_API_URL}/users/jwt/xnft?xnftAddress=${xnftAddress}`
          );
          return (await response.json())?.jwt || "";
        } catch (e) {
          return "";
        }
      },
  }),
});

export const allUsers = selector({
  key: "allUsernamesDefault",
  get: async ({ get }) => {
    const background = get(backgroundClient);
    get(user); // Use this to retriger a fetch when the active username changes.
    return await background.request({
      method: UI_RPC_METHOD_ALL_USERS_READ,
      params: [],
    });
  },
});

export * from "./xnft-preferences";
