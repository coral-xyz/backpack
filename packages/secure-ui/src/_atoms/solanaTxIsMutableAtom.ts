import { Transaction } from "@solana/web3.js";
import { selectorFamily } from "recoil";

import { solanaTransactionAtom } from "./solanaTransactionAtom";

export const solanaTxIsMutableAtom = selectorFamily<
  boolean,
  {
    disableTxMutation?: boolean;
    tx: string;
  }
>({
  key: "solanaTxIsMutable",
  get:
    (request) =>
    async ({ get }) => {
      // or transaction already has signers
      const { transaction } = get(solanaTransactionAtom(request));
      const hasValidSignatures =
        transaction.signatures.length > 0 &&
        transaction.signatures.some((sig) => !sig.every((s) => s === 0));

      // either this event should not mutate at all (ie signTransaction requests)
      if (request.disableTxMutation === true) {
        return false;
      }

      return !hasValidSignatures;
    },
});
