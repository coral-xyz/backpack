import { Transaction } from "@solana/web3.js";
import { selectorFamily } from "recoil";

import { solanaTransactionAtom } from "./solanaTransactionAtom";

export const solanaTxIsMutableAtom = selectorFamily<
  boolean,
  {
    disableFeeInjection?: boolean;
    tx: string;
  }
>({
  key: "solanaTxIsMutable",
  get:
    (request) =>
    async ({ get }) => {
      /*
      // either this event should not mutate at all (ie signTransaction requests)
      if (request.disableFeeInjection === true) {
        return false;
      }
      const transaction = get(solanaTransactionAtom(request));

      if (transaction instanceof Transaction) {
        return !transaction.signatures.some((sig) => sig.signature !== null);
      } else {
        const hasValidSignatures =
          transaction.signatures.length > 0 &&
          transaction.signatures.some((sig) => !sig.every((s) => s === 0));
        return transaction.version === "legacy" && !hasValidSignatures;
      }
			*/
      return false;
    },
});
