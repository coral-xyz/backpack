import { Blockchain } from "@coral-xyz/common";
import type {
  AddressLookupTableAccount,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ComputeBudgetProgram,
  Keypair,
  Transaction,
  TransactionMessage,
  VersionedMessage,
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
