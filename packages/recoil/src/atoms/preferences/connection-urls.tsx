import { Blockchain } from "@coral-xyz/common";
import { atom, selector } from "recoil";

import { ethereumConnectionUrl } from "../ethereum";
import { solanaConnectionUrl } from "../solana";

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
