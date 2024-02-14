import { solanaClientAtom } from "@coral-xyz/recoil";
import {
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { selectorFamily } from "recoil";

import { solanaTransactionAccountsAtom } from "./solanaTransactionAccountsAtom";

export const solanaTransactionAtom = selectorFamily<
  {
    transaction: VersionedTransaction;
    message: TransactionMessage;
  },
  {
    tx: string;
  }
>({
  key: "solanaTransactionAtom",
  get:
    (request) =>
    async ({ get }) => {
      const transaction: VersionedTransaction =
        VersionedTransaction.deserialize(bs58.decode(request.tx));
      const transactionAccounts = get(
        solanaTransactionAccountsAtom(request.tx)
      );

      const message = TransactionMessage.decompile(
        transaction.message,
        transactionAccounts.addressLookupTableAccounts
          ? {
              addressLookupTableAccounts:
                transactionAccounts.addressLookupTableAccounts,
            }
          : undefined
      );

      return {
        transaction,
        message,
      };
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
