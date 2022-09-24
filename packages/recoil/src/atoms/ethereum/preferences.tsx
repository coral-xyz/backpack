import { atom, selector } from "recoil";
import {
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_READ,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_READ,
  UI_RPC_METHOD_ETHEREUM_EXPLORER_READ,
} from "@coral-xyz/common";
import { backgroundClient } from "../client";

export const ethereumExplorer = atom<string | null>({
  key: "ethereumExplorer",
  default: selector({
    key: "ethereumExplorerDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_ETHEREUM_EXPLORER_READ,
        params: [],
      });
    },
  }),
});

/**
 * URL to the network to communicate with.
 */
export const ethereumConnectionUrl = atom<string>({
  key: "ethereumConnectionUrl",
  default: selector({
    key: "ethereumConnectionUrlDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_READ,
        params: [],
      });
    },
  }),
});

/**
 * Chain ID of the network to communicate with.
 * Note that often this can be determined from the connection URL, but it
 * can also be independent, e.g. http://localhost:8545 may have any chain id.
 */
export const ethereumChainId = atom<string>({
  key: "ethereumChainId",
  default: selector({
    key: "ethereumChainIdDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_ETHEREUM_CHAIN_ID_READ,
        params: [],
      });
    },
  }),
});
