import { PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
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

export const CreateEthereumPublicKey = EthereumPublicKey.extend({
  signature: z.string(),
});

export const CreateSolanaPublicKey = SolanaPublicKey.extend({
  signature: z.string(),
});

export const CreatePublicKeys = z.discriminatedUnion("blockchain", [
  CreateEthereumPublicKey,
  CreateSolanaPublicKey,
]);

export const CreateUserWithPublicKeys = BaseCreateUser.extend({
  blockchainPublicKeys: CreatePublicKeys.array(),
});
