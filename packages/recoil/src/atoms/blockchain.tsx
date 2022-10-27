import { atom, selector } from "recoil";
import {
  Blockchain,
  UI_RPC_METHOD_BLOCKCHAINS_ENABLED_READ,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
} from "@coral-xyz/common";
import { backgroundClient } from "./client";

export const availableBlockchains = atom({
  key: "blockchains",
  default: [Blockchain.SOLANA, Blockchain.ETHEREUM],
});

export const enabledBlockchains = atom({
  key: "enabledBlockchains",
  default: selector({
    key: "enabledBlockchainsDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_BLOCKCHAINS_ENABLED_READ,
        params: [],
      });
    },
  }),
});

export const blockchainKeyrings = atom({
  key: "blockchainKeyrings",
  default: selector({
    key: "blockchainKeyringsDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      return background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
        params: [],
      });
    },
  }),
});
