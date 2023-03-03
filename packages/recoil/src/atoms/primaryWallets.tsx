import type { ServerPublicKey } from "@coral-xyz/common";
import { selector } from "recoil";

import { serverPublicKeys } from "./wallet";

export const primaryWallets = selector<Array<ServerPublicKey>>({
  key: "primaryWallets",
  get: ({ get }) => {
    return get(serverPublicKeys).filter((s) => s.primary);
  },
});
