import express from "express";
import { authMiddleware, authSignatureMiddleware } from "../auth/middleware";
import { getUserIdFromPubkey } from "../db/users";
import { isXnftOwner } from "../solana";
import { PublicKey, Connection } from "@solana/web3.js";
import { IDL, Xnft } from "@coral-xyz/common";
import { Program } from "@project-serum/anchor";
import type { Provider } from "@project-serum/anchor";
import { createXnftSecret, fetchXnftSecret } from "../db/xnftSecrets";

export const XNFT_PROGRAM_ID = new PublicKey(
  "BaHSGaf883GA3u8qSC5wNigcXyaScJLSBJZbALWvPcjs"
);

export function xnftClient(provider: Provider): Program<Xnft> {
  return new Program<Xnft>(IDL, XNFT_PROGRAM_ID, provider);
}

const router = express.Router();

router.get("/accessSecret", authSignatureMiddleware, async (req, res) => {
  //@ts-ignore
  const publicKey: string = req.publicKey;
  //@ts-ignore
  const xnftId = req.query.xnftId;
  if (!(await isXnftOwner(publicKey, xnftId))) {
    return res.status(403).json({
      msg: "You don't own this xnft",
    });
  }
  fetchXnftSecret(xnftId)
    .then(({ secret }) => res.json({ secret }))
    .catch((e) => res.status(503).json({ msg: "Internal error" }));
});

router.post("/accessSecret", authSignatureMiddleware, async (req, res) => {
  //@ts-ignore
  const publicKey: string = req.publicKey;
  const xnftId = req.body.xnftId;
  if (!(await isXnftOwner(publicKey, xnftId))) {
    return res.status(403).json({
      msg: "You don't own this xnft",
    });
  }
  const secret = await createXnftSecret(xnftId);
  res.json({ secret });
});

export default router;
