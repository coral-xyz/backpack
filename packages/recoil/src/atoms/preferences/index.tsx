import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  UI_RPC_METHOD_ALL_USERS_READ,
  UI_RPC_METHOD_PREFERENCES_READ,
  UI_RPC_METHOD_USER_READ,
} from "@coral-xyz/common";
import {
  atom,
  atomFamily,
  DefaultValue,
  selector,
  selectorFamily,
} from "recoil";

import { backgroundClient } from "../client";

export const preferences = atom<any>({
  key: "preferences",
  default: selector({
    key: "preferencesDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      // Preferences are dependent on the current active user
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
      async (): Promise<string> => {
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
    get(allUsersTrigger); // Use this to retriger a fetch when the active username changes.
    return await background.request({
      method: UI_RPC_METHOD_ALL_USERS_READ,
      params: [],
    });
  },
  set: ({ set }, value) => {
    if (value instanceof DefaultValue) {
      set(allUsersTrigger, (v) => v + 1);
    }
  },
});

// This atom is used for nothing other than re-triggering the allUsers fetch.
export const allUsersTrigger = atom<number>({
  key: "allUsersTrigger",
  default: 0,
});

export * from "./xnft-preferences";
