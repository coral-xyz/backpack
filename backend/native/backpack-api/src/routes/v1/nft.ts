import { Blockchain } from "@coral-xyz/common";
import express from "express";

import { extractUserId } from "../../auth/middleware";
import { addNfts } from "../../db/nft";
import { getUsersByPublicKeys } from "../../db/users";
import { validateOwnership } from "../../utils/metaplex";

const router = express.Router();

router.post("/bulk", extractUserId, async (req, res) => {
  // @ts-ignore
  const userId: string = req.id;
  const nfts = req.body.nfts;
  const publicKey: string = req.body.publicKey;
  const users = await getUsersByPublicKeys([
    {
      blockchain: Blockchain.SOLANA,
      publicKey,
    },
  ]);
  if (users[0].user_id !== userId) {
    return res.status(403).json({
      msg: "User doesn't own this public key",
    });
  }

  const responses = await Promise.all(
    nfts.map((nft: { nftId: string; collectionId: string }) =>
      validateOwnership(nft.nftId, nft.collectionId, publicKey)
    )
  );

  await addNfts(
    publicKey,
    nfts.filter((_x: any, index: number) => responses[index])
  );
  res.json({});
});

export default router;
