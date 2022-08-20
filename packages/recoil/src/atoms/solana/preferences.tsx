import { atom, selector } from "recoil";

import { Commitment } from "@solana/web3.js";
import {
  UI_RPC_METHOD_SOLANA_CONNECTION_URL_READ,
  UI_RPC_METHOD_SOLANA_EXPLORER_READ,
  UI_RPC_METHOD_SOLANA_COMMITMENT_READ,
} from "@coral-xyz/common";
import { backgroundClient } from "../client";

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
export const solanaConnectionUrl = atom<string | null>({
  key: "solanaConnectionUrl",
  default: selector({
    key: "solanaConnectionUrlDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_SOLANA_CONNECTION_URL_READ,
        params: [],
      });
    },
  }),
});
