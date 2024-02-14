import { solanaClientAtom } from "@coral-xyz/recoil";
import {
  VersionedTransaction,
  AddressLookupTableAccount,
} from "@solana/web3.js";
import { decode } from "bs58";
import { selectorFamily } from "recoil";

export type SolanaTransactionAccounts = {
  signedWritable: string[];
  signedReadonly: string[];
  writable: string[];
  readonly: string[];
  addressLookupTableAccounts: AddressLookupTableAccount[];
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
      const transaction = VersionedTransaction.deserialize(decode(tx));
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
        addressLookupTableAccounts,
      };

      return transactionAccounts;
    },
  dangerouslyAllowMutability: true,
});
