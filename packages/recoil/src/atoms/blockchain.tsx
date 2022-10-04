import { atom, selector } from "recoil";
import {
  Blockchain,
  UI_RPC_METHOD_ENABLED_BLOCKCHAINS_READ,
} from "@coral-xyz/common";
import { backgroundClient } from "./client";

export const blockchains = atom({
  key: "blockchains",
  default: [Blockchain.SOLANA, Blockchain.ETHEREUM],
});

export const enabledBlockchains = atom({
  key: "enabledBlockchains",
  default: selector({
    key: "enabledBlockchainsDefault",
    get: ({ get }) => {
      const background = get(backgroundClient);
      const enabled = background.request({
        method: UI_RPC_METHOD_ENABLED_BLOCKCHAINS_READ,
        params: [],
      });
      console.log(enabled);
      return enabled;
    },
  }),
});
