import type { Commitment } from "@solana/web3.js";
import { selector } from "recoil";

import { preferences } from "../preferences";

export const solanaExplorer = selector<string>({
  key: "solanaExplorer",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.solana.explorer;
  },
});

export const solanaCommitment = selector<Commitment>({
  key: "solanaCommitment",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.solana.commitment;
  },
});

/**
 * URL to the cluster to communicate with.
 */
export const solanaConnectionUrl = selector<string>({
  key: "solanaConnectionUrl",
  get: ({ get }) => {
    const p = get(preferences);
    return p.solana.cluster;
  },
});
