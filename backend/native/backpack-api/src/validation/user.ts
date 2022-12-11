import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ethers } from "ethers";
import { sign } from "tweetnacl";
import { z } from "zod";

export const BaseCreateUser = z.object({
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,15}$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores."
    ),
  inviteCode: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      "is in an invalid format"
    ),
  waitlistId: z.optional(z.nullable(z.string())),
});

//
// Public key / blockchain
//

export const SolanaPublicKey = z.object({
  publicKey: z.string().refine((str) => {
    try {
      new PublicKey(str);
      return true;
    } catch {
      // Pass
    }
    return false;
  }, "must be a valid Solana public key"),
  blockchain: z.literal("solana"),
});

export const EthereumPublicKey = z.object({
  publicKey: z.string().refine((str) => {
    try {
      ethers.utils.getAddress(str);
      return true;
    } catch {
      // Pass
    }
    return false;
  }, "must be a valid Ethereum public key"),
  blockchain: z.literal("ethereum"),
});

export const BlockchainPublicKey = z.discriminatedUnion("blockchain", [
  SolanaPublicKey,
  EthereumPublicKey,
]);

//
// User creation
//

export const CreateEthereumKeyring = EthereumPublicKey.extend({
  signature: z.string(),
});

export const CreateSolanaKeyring = SolanaPublicKey.extend({
  signature: z.string(),
});

export const CreateKeyrings = z.discriminatedUnion("blockchain", [
  CreateEthereumKeyring,
  CreateSolanaKeyring,
]);

export const CreateUserWithKeyrings = BaseCreateUser.extend({
  blockchainPublicKeys: CreateKeyrings.array(),
});

//
// Signature validation for blockchains
//

/**
 * Validate a signed Ethereum message
 */
export const validateEthereumSignature = (
  msg: Buffer,
  signature: string,
  publicKey: string
) => {
  return ethers.utils.verifyMessage(msg, signature) === publicKey;
};

/**
 * Validate a signed Solana dummy transaction (faux message signing)
 */
export const validateSolanaSignature = (
  msg: Buffer,
  signature: Uint8Array,
  publicKey: Uint8Array
) => {
  if (sign.detached.verify(msg, signature, publicKey)) {
    return true;
  }

  try {
    // This might be a Solana transaction because that is used for Ledger which
    // does not support signMessage
    const tx = new Transaction();
    tx.add(
      new TransactionInstruction({
        programId: new PublicKey(publicKey),
        keys: [],
        data: msg,
      })
    );
    tx.feePayer = new PublicKey(publicKey);
    // Not actually needed as it's not transmitted to the network
    tx.recentBlockhash = tx.feePayer.toString();
    tx.addSignature(new PublicKey(publicKey), Buffer.from(signature));
    return tx.verifySignatures();
  } catch (err) {
    console.error("dummy solana transaction error", err);
    return false;
  }
};
