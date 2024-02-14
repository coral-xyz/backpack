import { secureUserAtom, solanaClientAtom } from "@coral-xyz/recoil";
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { decode, encode } from "bs58";
import { atomFamily, selectorFamily, waitForAll } from "recoil";

import {
  SolanaTransactionAccounts,
  solanaTransactionAccountsAtom,
} from "./solanaTransactionAccountsAtom";
import { solanaTransactionAtom } from "./solanaTransactionAtom";
import { solanaTxDowngradableAccountsAtom } from "./solanaTxDowngradableAccountsAtom";
import { solanaTxIsMutableAtom } from "./solanaTxIsMutableAtom";
import { solanaTxOverridesAtom } from "./solanaTxOverridesAtom";
import { solanaTxPriorityFeeAtom } from "./solanaTxPriorityFeeAtom";
import { TransactionOverrides } from "../_types/SolanaTransactionOverrides";

export const solanaAllMutatedTransactionAtom = selectorFamily<
  string[],
  {
    txs: string[];
    publicKey: string;
    disableTxMutation?: boolean;
  }
>({
  key: "solanaAllMutatedTransactionAtom",
  get:
    (request) =>
    async ({ get }) => {
      return get(
        waitForAll(
          request.txs.map((tx) =>
            solanaMutatedTransactionAtom({ ...request, tx })
          )
        )
      );
    },
});

export const solanaMutatedTransactionAtom = selectorFamily<
  string,
  {
    tx: string;
    publicKey: string;
    disableTxMutation?: boolean;
  }
>({
  key: "solanaMutatedTransactionAtom",
  get:
    (request) =>
    async ({ get }) => {
      const transactionOverrides = get(solanaTxOverridesAtom(request));
      const { transaction, message } = get(solanaTransactionAtom(request));
      try {
        const mutatedTx = sanitizeTransactionWithOverrides(
          request.tx,
          transaction,
          message,
          transactionOverrides
        );
        return mutatedTx;
      } catch {
        // if somethign fails return original transaction
        return request.tx;
      }
    },
});

function sanitizeTransactionWithOverrides(
  txStr: string,
  transaction: VersionedTransaction,
  message: TransactionMessage,
  transactionOverrides: TransactionOverrides
) {
  // dont do anything if we dont need to
  if (
    !transactionOverrides ||
    (transactionOverrides?.disableFeeConfig &&
      transactionOverrides?.disableDowngradeAccounts)
  ) {
    return txStr;
  }

  const version = transaction.message.version;
  const newMessage = new TransactionMessage(message);

  if (!transactionOverrides.disableFeeConfig) {
    // Strip any existing CBP instructions from the transaction
    //
    // NOTE: if there was a pre-existing CBP unit limit or unit price
    //       instruction, its parameter value would have been used as the override
    //       default, and will thus be re-prepended to the transaction if still set
    const coreIxs = [
      ...message.instructions.filter(
        (ix) => !ix.programId.equals(ComputeBudgetProgram.programId)
      ),
    ];

    // Reset the array of instructions for the transaction in preparation for prepending
    newMessage.instructions = [];

    // Prepend unit price instruction if set
    if (BigInt(transactionOverrides.priorityFee) > BigInt(0)) {
      newMessage.instructions.push(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: BigInt(transactionOverrides.priorityFee),
        })
      );
    }

    // Prepend unit limit instruction if set
    if (parseInt(transactionOverrides.computeUnits) > 0) {
      newMessage.instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: parseInt(transactionOverrides.computeUnits),
        })
      );
    }

    newMessage.instructions.push(...coreIxs);
  }

  if (!transactionOverrides.disableDowngradeAccounts) {
    newMessage.instructions.forEach((ix) => {
      ix.keys.forEach((key) => {
        // downgrade account to read-only if necessary
        if (
          transactionOverrides.downgradedWritableAccounts.includes(
            key.pubkey.toBase58()
          )
        ) {
          key.isWritable = false;
        }
      });
    });
  }

  const compiledMessage =
    version === "legacy"
      ? newMessage.compileToLegacyMessage()
      : newMessage.compileToV0Message();

  const newTransaction = new VersionedTransaction(compiledMessage);
  const serializedNewTransaction = newTransaction.serialize();

  // if transaction size is too large after adding fee ix -> reset tx
  if (serializedNewTransaction.byteLength > 1232) {
    return txStr;
  }

  return encode(serializedNewTransaction);
}
