import { Blockchain } from "@coral-xyz/common";
import {
  ComputeBudgetProgram,
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { fromSeed } from "bip32";
import { decode, encode } from "bs58";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";

export type SolanaFeeConfig = { computeUnits: number; priorityFee: bigint };

// Returns the account Keypair for the given seed and derivation path.
export function deriveSolanaKeypair(
  seed: Buffer,
  derivationPath: string
): Keypair {
  const secret = deriveSolanaPrivateKey(seed, derivationPath);
  return Keypair.fromSecretKey(secret);
}

export function deriveSolanaPrivateKey(
  seed: Buffer,
  derivationPath: string
): Uint8Array {
  let derivedSeed: Buffer;
  if (derivationPath.startsWith("501'")) {
    // Sollet deprecated path
    derivedSeed = fromSeed(seed).derivePath(derivationPath).privateKey!;
  } else {
    derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;
  }
  return nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
}

export function getSolanaKeypair(privateKey: string): Keypair {
  let keypair: Keypair | null = null;
  try {
    // Attempt to create a keypair from JSON secret key
    keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
  } catch {
    // Try the next method
    try {
      // Attempt to create a keypair from bs58 decode of secret key
      keypair = Keypair.fromSecretKey(new Uint8Array(decode(privateKey)));
    } catch {
      // Try the next method
      try {
        // Attempt to create a keypair from hex decode of secret key
        keypair = Keypair.fromSecretKey(Buffer.from(privateKey, "hex"));
      } catch {
        // Failure, no other ways to interpret
        throw new Error("Invalid Solana private key");
      }
    }
  }

  return keypair;
}

export type TransactionOverrides = {
  disableFeeConfig: boolean;
  priorityFee: string;
  computeUnits: string;
  disableDowngradeAccounts: boolean;
  downgradedWritableAccounts: string[];
};

export async function sanitizeTransactionWithOverrides(
  publicKey: string,
  txStr: string,
  blockchain: Blockchain,
  transactionOverrides: TransactionOverrides
) {
  if (blockchain === Blockchain.SOLANA) {
    const tx = deserializeTransaction(txStr);
    if (tx.version !== "legacy") {
      return txStr;
    }

    let transaction = deserializeLegacyTransaction(txStr);

    if (!transactionOverrides.disableFeeConfig) {
      // Strip any existing CBP instructions from the transaction
      //
      // NOTE: if there was a pre-existing CBP unit limit or unit price
      //       instruction, its parameter value would have been used as the override
      //       default, and will thus be re-prepended to the transaction if still set
      const coreIxs = [
        ...transaction.instructions.filter(
          (ix) => !ix.programId.equals(ComputeBudgetProgram.programId)
        ),
      ];

      // Reset the array of instructions for the transaction in preparation for prepending
      transaction.instructions = [];

      // Prepend unit price instruction if set
      if (BigInt(transactionOverrides.priorityFee) > BigInt(0)) {
        transaction.add(
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: BigInt(transactionOverrides.priorityFee),
          })
        );
      }

      // Prepend unit limit instruction if set
      if (parseInt(transactionOverrides.computeUnits) > 0) {
        transaction.add(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: parseInt(transactionOverrides.computeUnits),
          })
        );
      }

      transaction.add(...coreIxs);

      // if transaction size is too large after adding fee ix -> reset tx
      if (getTransactionSize(transaction, publicKey) > 1232) {
        transaction = deserializeLegacyTransaction(txStr);
      }
    }

    if (!transactionOverrides.disableDowngradeAccounts) {
      // Not sure where the logic that checks if the transaction is partially signed but
      transaction.instructions.forEach((ix) => {
        ix.keys.forEach((key) => {
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

    return encode(
      transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
    );
  } else {
    return txStr;
  }
}

export const deserializeTransaction = (serializedTx: string) => {
  return VersionedTransaction.deserialize(decode(serializedTx));
};

export const deserializeLegacyTransaction = (serializedTx: string) => {
  return Transaction.from(decode(serializedTx));
};

export const isVersionedTransaction = (
  tx: Transaction | VersionedTransaction
): tx is VersionedTransaction => {
  return "version" in tx;
};

export const getTransactionSize = (
  tx: Transaction,
  feePayer: string
): number => {
  const feePayerPk = [feePayer];

  const signers = new Set<string>(feePayerPk);
  const accounts = new Set<string>(feePayerPk);

  const ixsSize = tx.instructions.reduce((acc, ix) => {
    ix.keys.forEach(({ pubkey, isSigner }) => {
      const pk = pubkey.toBase58();
      if (isSigner) signers.add(pk);
      accounts.add(pk);
    });

    accounts.add(ix.programId.toBase58());

    const nIndexes = ix.keys.length;
    const opaqueData = ix.data.length;

    return (
      acc +
      1 + // PID index
      compactArraySize(nIndexes, 1) +
      compactArraySize(opaqueData, 1)
    );
  }, 0);

  return (
    compactArraySize(signers.size, 64) + // signatures
    3 + // header
    compactArraySize(accounts.size, 32) + // accounts
    32 + // blockhash
    compactHeader(tx.instructions.length) + // instructions
    ixsSize
  );
};

// COMPACT ARRAY

const LOW_VALUE = 127; // 0x7f
const HIGH_VALUE = 16383; // 0x3fff

/**
 * Compact u16 array header size
 * @param n elements in the compact array
 * @returns size in bytes of array header
 */
const compactHeader = (n: number) =>
  n <= LOW_VALUE ? 1 : n <= HIGH_VALUE ? 2 : 3;

/**
 * Compact u16 array size
 * @param n elements in the compact array
 * @param size bytes per each element
 * @returns size in bytes of array
 */
const compactArraySize = (n: number, size: number) =>
  compactHeader(n) + n * size;
