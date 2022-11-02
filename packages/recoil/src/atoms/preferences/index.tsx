import { atom, selector } from "recoil";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_AUTOLOCK_READ,
  UI_RPC_METHOD_APPROVED_ORIGINS_READ,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
  UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_READ,
  UI_RPC_METHOD_USERNAME_READ,
} from "@coral-xyz/common";
import { solanaConnectionUrl } from "../solana";
import { ethereumConnectionUrl } from "../ethereum";
import { backgroundClient } from "../client";

export const isDarkMode = atom<boolean | null>({
  key: "isDarkMode",
  default: selector({
    key: "isDarkModeDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
        params: [],
      });
    },
  }),
});

export const isDeveloperMode = atom<boolean | null>({
  key: "isDeveloperMode",
  default: selector({
    key: "isDeveloperModeDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_READ,
        params: [],
      });
    },
  }),
});

export const autoLockSecs = atom<number | null>({
  key: "autoLockSecs",
  default: selector({
    key: "autoLockSecsDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_KEYRING_AUTOLOCK_READ,
        params: [],
      });
    },
  }),
});

export const approvedOrigins = atom<Array<string> | null>({
  key: "approvedOrigins",
  default: selector({
    key: "approvedOriginsDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_APPROVED_ORIGINS_READ,
        params: [],
      });
    },
  }),
});

export const connectionUrls = atom<{ [key: string]: string | null }>({
  key: "connectionUrls",
  default: selector({
    key: "connectionUrlsDefault",
    get: async ({ get }) => {
      return {
        [Blockchain.SOLANA as string]: get(solanaConnectionUrl),
        [Blockchain.ETHEREUM as string]: get(ethereumConnectionUrl),
      };
    },
  }),
});

export const username = atom<string | null>({
  key: "username",
  default: selector({
    key: "usernameDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_USERNAME_READ,
        params: [],
      });
    },
  }),
});
