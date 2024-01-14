import { solanaClientAtom } from "@coral-xyz/recoil";
import {
  deserializeLegacyTransaction,
  deserializeTransaction,
} from "@coral-xyz/secure-clients/legacyCommon";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { selectorFamily } from "recoil";

export const solanaTransactionAtom = selectorFamily<
  VersionedTransaction | Transaction,
  {
    tx: string;
  }
>({
  key: "solanaTransactionAtom",
  get:
    (request) =>
    async ({ get }) => {
      let deserializedTransaction: VersionedTransaction | Transaction =
        deserializeTransaction(request.tx);

      if (deserializedTransaction.version === "legacy") {
        deserializedTransaction = deserializeLegacyTransaction(request.tx);
      }
      return deserializedTransaction;
    },
  dangerouslyAllowMutability: true,
});

export const solanaPublicKeyHasGas = selectorFamily<
  boolean,
  {
    publicKey: string;
  }
>({
  key: "solanaTransactionAtom",
  get:
    (request) =>
    async ({ get }) => {
      const solanaClient = get(solanaClientAtom);

      return solanaClient.connection
        .getBalance(new PublicKey(request.publicKey))
        .then((balance) => {
          return balance > 0;
        });
    },
});
