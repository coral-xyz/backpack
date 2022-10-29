import { z } from "zod";

const ZodChain = z.enum(["solana", "ethereum"]);
export type BlockChain = z.infer<typeof ZodChain>;

export const CreateSessionRequest = z.object({
  chain: ZodChain,
  publicKey: z.string(),
});
