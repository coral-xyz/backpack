import express from "express";

import { extractUserId } from "../../auth/middleware";

const router = express.Router();

router.post("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const userId: string = req.id;
  const nfts = req.body.nfts;
  // TODO: add auth here
  nfts.forEach(({ nftId, collectionId }) => {});
});

export default router;
