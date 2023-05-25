import type { AutolockSettings, Preferences } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  DEFAULT_AUTO_LOCK_INTERVAL_SECS,
  isMobile,
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

export const preferences = atom<Preferences>({
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
  effects: [
    ({ onSet }) => {
      onSet((preferences: Preferences) => {
        //
        // On extension, we write preferences to the local storage of the UI so that
        // we can use it without hitting the service worker on app load. See
        // src/app/App.tsx for the user of this.
        //
        if (!isMobile()) {
          window.localStorage.setItem(
            "preferences",
            JSON.stringify(preferences)
          );
        }
      });
    },
  ],
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

// This is the actively authenticated user. Note there is a delay between
// switching a user on the client and the authenticated user being updated
// because it requires a HTTP request to ensure authentication.
export const authenticatedUser = atom<{
  username: string;
  uuid: string;
  jwt: string;
} | null>({
  key: "authenticatedUser",
  default: null,
});

export const xnftJwt = atomFamily({
  key: "xnftJwt",
  default: selectorFamily({
    key: "xnftJwtDefault",
    get:
      ({ xnftAddress }: { xnftAddress: string }) =>
      async ({ get }): Promise<string> => {
        try {
          // If a different user opens the same xNFT we want to force a new
          // HTTP request that includes their authentication JWT.
          get(authenticatedUser);
          // get(activeWallet); // Uncomment if including the pubkey in the jwt
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
