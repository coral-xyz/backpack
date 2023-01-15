import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  UI_RPC_METHOD_ALL_USERS_READ,
  UI_RPC_METHOD_PREFERENCES_READ,
  UI_RPC_METHOD_USER_READ,
  getLogger,
} from "@coral-xyz/common";
import {
  atom,
  atomFamily,
  DefaultValue,
  selector,
  selectorFamily,
} from "recoil";

import { backgroundClient } from "../client";

const logger = getLogger("KKKK");

export const preferences = atom<any>({
  key: "preferences",
  default: selector({
    key: "preferencesDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      // Preferences are dependent on the current active user
      const _user = get(user);
      try {
        const res = await background.request({
          method: UI_RPC_METHOD_PREFERENCES_READ,
          params: [_user.uuid],
        });
        logger.debug("atom.preferences result", res);
        return res;
      } catch (err) {
        logger.debug("atom.preferences error", err);
        return {};
      }
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

export const autoLockSettings = selector<{
  seconds?: number;
  option?: "never" | "onClose";
}>({
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
    logger.debug("atom.isAggregateWallets p:pre");
    try {
      const p = get(preferences);
      logger.debug("atom.isAggregateWallets p", p);
      logger.debug(
        "atom.isAggregateWallets p.aggregateWallets",
        p.aggregateWallets.toString()
      );
      return Boolean(p.aggregateWallets);
    } catch (error) {
      logger.debug("atom.isAggregateWallets error", error);
      return false;
    }
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
      try {
        logger.debug("atom.user pre");
        const res = await background.request({
          method: UI_RPC_METHOD_USER_READ,
          params: [],
        });
        logger.debug("atom.user res", res);
        return res;
      } catch (error) {
        logger.debug("atom.user error", error);
        return { username: "", uuid: "", jwt: "" };
      }
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

export const DEFAULT_AUTO_LOCK_INTERVAL_SECS = 15 * 60;

// This atom is used for nothing other than re-triggering the allUsers fetch.
export const allUsersTrigger = atom<number>({
  key: "allUsersTrigger",
  default: 0,
});

export * from "./xnft-preferences";
