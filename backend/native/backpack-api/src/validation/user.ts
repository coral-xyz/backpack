import { z } from "zod";

import { BLOCKCHAINS_NATIVE } from "../blockchains";

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
export const BlockchainPublicKey = z.discriminatedUnion(
  "blockchain",
  Object.values(BLOCKCHAINS_NATIVE).map((native) => native.ZodPublicKey())
);

//
// User creation
//
export const CreatePublicKeys = z.discriminatedUnion(
  "blockchain",
  Object.values(BLOCKCHAINS_NATIVE).map((native) => native.ZodCreatePublicKey())
);

export const CreateUserWithPublicKeys = BaseCreateUser.extend({
  blockchainPublicKeys: CreatePublicKeys.array(),
});
