import type { Blockchain } from "@coral-xyz/common";
import type { Request, Response } from "express";
import express from "express";

import { getUsersByPublicKeys } from "../../db/users";
import { BlockchainPublicKey } from "../../validation/user";

const router = express.Router();

/**
 * Get usernames for an array of public keys.
 */
router.post("/publicKeys", async (req: Request, res: Response) => {
  const blockchainPublicKeys = BlockchainPublicKey.array().parse(req.body);

  const users = getUsersByPublicKeys(
    blockchainPublicKeys.map((b) => ({
      blockchain: b.blockchain as Blockchain,
      publicKey: b.publicKey,
    }))
  );

  return res.status(200).json(users);
});

export default router;
