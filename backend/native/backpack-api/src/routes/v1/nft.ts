import express from "express";

import { extractUserId } from "../../auth/middleware";
import { addNfts } from "../../db/nft";

const router = express.Router();

router.post("/bulk", extractUserId, async (req, res) => {
  // @ts-ignore
  const userId: string = req.id;
  const nfts = req.body.nfts;
  const publicKey: string = req.body.publicKey;
  // TODO: add auth here to check if user owns publicKey, user nft belongs to the collection
  await addNfts(publicKey, nfts);
  res.json({});
});

export default router;
