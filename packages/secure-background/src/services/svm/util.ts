import type { SolanaFeeConfig } from "@coral-xyz/common";
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

export async function sanitizeTransactionWithFeeConfig(
  txStr: string,
  blockchain: Blockchain,
  feeConfig: { disabled: boolean; config: SolanaFeeConfig }
) {
  if (blockchain === Blockchain.SOLANA && !feeConfig.disabled) {
    const tx = deserializeTransaction(txStr);
    if (tx.version !== "legacy") {
      return txStr;
    }

    const transaction = deserializeLegacyTransaction(txStr);

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
    if (feeConfig.config.priorityFee > BigInt(0)) {
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: feeConfig.config.priorityFee,
        })
      );
    }

    // Prepend unit limit instruction if set
    if (feeConfig.config.computeUnits > 0) {
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: feeConfig.config.computeUnits,
        })
      );
    }

    transaction.add(...coreIxs);
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
