import type { Blockchain } from "@coral-xyz/common";
import type { NextFunction, Request, Response } from "express";
import express from "express";

import { getUsersByPublicKeys } from "../../db/users";
import { BlockchainPublicKey } from "../../validation/user";

const router = express.Router();

/**
 * Get usernames for an array of public keys.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  let blockchainPublicKeys: any;
  try {
    blockchainPublicKeys = BlockchainPublicKey.array().parse(req.body);
  } catch (error) {
    next(error);
    return;
  }

  const users = await getUsersByPublicKeys(
    blockchainPublicKeys!.map((b: any) => ({
      blockchain: b.blockchain as Blockchain,
      publicKey: b.publicKey,
    }))
  );

  return res.status(200).json(
    users.map((u) => ({
      blockchain: u.blockchain,
      public_key: u.public_key,
    }))
  );
});

export default router;
