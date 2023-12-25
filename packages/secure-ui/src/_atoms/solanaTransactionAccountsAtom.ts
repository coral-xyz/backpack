import { solanaClientAtom } from "@coral-xyz/recoil";
import {
  deserializeTransaction,
  deserializeLegacyTransaction,
  isVersionedTransaction,
} from "@coral-xyz/secure-clients/legacyCommon";
import {
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Message,
  Transaction,
  VersionedTransaction,
  AddressLookupTableAccount,
} from "@solana/web3.js";
import { atomFamily, selectorFamily } from "recoil";

export type SolanaTransactionAccounts = {
  signedWritable: string[];
  signedReadonly: string[];
  writable: string[];
  readonly: string[];
};

export const solanaTransactionAccountsAtom = selectorFamily<
  SolanaTransactionAccounts,
  string
>({
  key: "solanaTransactionAccountsAtom",
  get:
    (tx) =>
    async ({ get }) => {
      const solanaClient = get(solanaClientAtom);

      const deserializedTransaction: VersionedTransaction | Transaction =
        deserializeTransaction(tx);

      if (deserializedTransaction.version === "legacy") {
        const transaction: Transaction = deserializeLegacyTransaction(tx);
        const message = transaction.compileMessage();
        const staticAccounts = message.accountKeys.map((publicKey) =>
          publicKey.toBase58()
        );

        const numSignedAccounts = message.header.numRequiredSignatures;
        const numUnsignedAccounts = staticAccounts.length - numSignedAccounts;

        const numSignedReadonly = message.header.numReadonlySignedAccounts;
        const numSignedWritable =
          message.header.numRequiredSignatures - numSignedReadonly;
        const numUnsignedReadonly = message.header.numReadonlyUnsignedAccounts;
        const numUnsignedWritable = numUnsignedAccounts - numUnsignedReadonly;

        const transactionAccounts = {
          signedWritable: staticAccounts.slice(0, numSignedWritable),
          signedReadonly: staticAccounts.slice(
            numSignedWritable,
            numSignedWritable + numSignedReadonly
          ),
          writable: staticAccounts.slice(
            numSignedAccounts,
            numSignedAccounts + numUnsignedWritable
          ),
          readonly: staticAccounts.slice(-numUnsignedReadonly),
        };

        return transactionAccounts;
      }
      if (deserializedTransaction.version === 0) {
        const transaction: VersionedTransaction = deserializedTransaction;
        const message = transaction.message;

        const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
        const addressTableLookups = message.addressTableLookups;
        if (addressTableLookups.length > 0) {
          for (const addressTableLookup of addressTableLookups) {
            const result = await solanaClient.connection.getAddressLookupTable(
              addressTableLookup.accountKey
            );
            if (result.value) {
              addressLookupTableAccounts.push(result.value);
            }
          }
        }
        const accountKeys = transaction.message.getAccountKeys({
          addressLookupTableAccounts,
        });
        const staticAccounts = accountKeys.staticAccountKeys.map((publicKey) =>
          publicKey.toBase58()
        );
        const lookupWritableAccounts =
          accountKeys.accountKeysFromLookups?.writable.map((publicKey) =>
            publicKey.toBase58()
          ) ?? [];
        const lookupReadonlyAccounts =
          accountKeys.accountKeysFromLookups?.readonly.map((publicKey) =>
            publicKey.toBase58()
          ) ?? [];

        const numSignedAccounts = message.header.numRequiredSignatures;
        const numUnsignedAccounts = staticAccounts.length - numSignedAccounts;

        const numSignedReadonly = message.header.numReadonlySignedAccounts;
        const numSignedWritable =
          message.header.numRequiredSignatures - numSignedReadonly;
        const numUnsignedReadonly = message.header.numReadonlyUnsignedAccounts;
        const numUnsignedWritable = numUnsignedAccounts - numUnsignedReadonly;

        const transactionAccounts = {
          signedWritable: staticAccounts.slice(0, numSignedWritable),
          signedReadonly: staticAccounts.slice(
            numSignedWritable,
            numSignedWritable + numSignedReadonly
          ),
          writable: staticAccounts
            .slice(numSignedAccounts, numSignedAccounts + numUnsignedWritable)
            .concat(lookupWritableAccounts),
          readonly: staticAccounts
            .slice(-numUnsignedReadonly)
            .concat(lookupReadonlyAccounts),
        };

        return transactionAccounts;
      }
      throw new Error("Unknown Transaction format");
    },
});
