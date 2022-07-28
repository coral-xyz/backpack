import { atom, selector } from "recoil";
import {
  UI_RPC_METHOD_KEYRING_AUTOLOCK_READ,
  UI_RPC_METHOD_APPROVED_ORIGINS_READ,
  UI_RPC_METHOD_SOLANA_EXPLORER_READ,
} from "@coral-xyz/common";
import { backgroundClient } from "./background";

/**
 * Toggle for darkmode.
 */
export const isDarkMode = atom<boolean | null>({
  key: "isDarkMode",
  default: true,
  // TODO: enable this.
  /*
  effects: [
    ({ setSelf }) => {
      const background = getBackgroundClient();
      setSelf(
        background.request({
          method: UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
          params: [],
        })
      );
    },
    ({ onSet }) => {
      onSet((darkMode: boolean | null) => {
        const background = getBackgroundClient();
        background
          .request({
            method: UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
            params: [darkMode],
          })
          .catch(console.error);
      });
    },
  ],
	*/
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
  default: null,
  effects: [
    ({ setSelf, getPromise }) => {
      setSelf(
        (async () => {
          const background = await getPromise(backgroundClient);
          return await background.request({
            method: UI_RPC_METHOD_APPROVED_ORIGINS_READ,
            params: [],
          });
        })()
      );
    },
  ],
});

export const solanaExplorer = atom<string | null>({
  key: "solanaExplorer",
  default: selector({
    key: "solanaExplorerDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_SOLANA_EXPLORER_READ,
        params: [],
      });
    },
  }),
});
