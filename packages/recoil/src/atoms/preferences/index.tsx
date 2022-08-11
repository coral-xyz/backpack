import { atom, selector } from "recoil";
import { Commitment } from "@solana/web3.js";
import {
  UI_RPC_METHOD_KEYRING_AUTOLOCK_READ,
  UI_RPC_METHOD_APPROVED_ORIGINS_READ,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
  UI_RPC_METHOD_SOLANA_CONNECTION_URL_READ,
  UI_RPC_METHOD_SOLANA_EXPLORER_READ,
  UI_RPC_METHOD_SOLANA_COMMITMENT_READ,
} from "@coral-xyz/common";
import { backgroundClient } from "../client";

export const isDarkMode = atom<boolean | null>({
  key: "isDarkMode",
  default: selector({
    key: "isDarkModeDefault",
    get: async ({ get }) => {
      try {
        const background = get(backgroundClient);
        return await background.request({
          method: UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
          params: [],
        });
      } catch (e) {
        // An error is thrown on first time wallet onboarding.
        console.error(e);
        return true;
      }
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

export const solanaCommitment = atom<Commitment | null>({
  key: "solanaCommitment",
  default: selector({
    key: "solanaCommitmentDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_SOLANA_COMMITMENT_READ,
        params: [],
      });
    },
  }),
});

/**
 * URL to the cluster to communicate with.
 */
export const connectionUrl = atom<string | null>({
  key: "clusterConnection",
  default: selector({
    key: "clusterConnectionDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_SOLANA_CONNECTION_URL_READ,
        params: [],
      });
    },
  }),
});
