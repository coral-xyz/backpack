import { selector } from "recoil";

import { preferences } from "../preferences";

export const ethereumExplorer = selector<string>({
  key: "ethereumExplorer",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.ethereum.explorer;
  },
});

/**
 * URL to the network to communicate with.
 */
export const ethereumConnectionUrl = selector<string>({
  key: "ethereumConnectionUrl",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.ethereum.connectionUrl;
  },
});

/**
 * Chain ID of the network to communicate with.
 * Note that often this can be determined from the connection URL, but it
 * can also be independent, e.g. http://localhost:8545 may have any chain id.
 */
export const ethereumChainId = selector<string>({
  key: "ethereumChainId",
  get: async ({ get }) => {
    const p = get(preferences);
    return p.ethereum.chainId;
  },
});
