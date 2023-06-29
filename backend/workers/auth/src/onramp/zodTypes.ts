import { Blockchain as BlockchainTy } from "@coral-xyz/common";
import { z } from "zod";

const ZodChain = z.enum(Object.values(BlockchainTy));
export type BlockChain = z.infer<typeof ZodChain>;

export const CreateSessionRequest = z.object({
  chain: ZodChain,
  publicKey: z.string(),
});
