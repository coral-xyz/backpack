import express from "express";
import { ethers } from "ethers";
import { getUser } from "../../db/users";
import { setCookie } from "../../auth/util";
import {
  validateSolanaSignature,
  validateEthereumSignature,
} from "../../validation/user";

const { base58 } = ethers.utils;

const router = express.Router();

router.post("/authenticate", async (req, res) => {
  const { blockchain, signature, publicKey, encodedMessage, message } =
    req.body;
  const { id } = JSON.parse(message);
  const decodedMessage = Buffer.from(base58.decode(encodedMessage));

  let valid = false;
  if (blockchain === "solana") {
    valid = validateSolanaSignature(
      decodedMessage,
      base58.decode(signature),
      base58.decode(publicKey)
    );
  } else if (blockchain === "ethereum") {
    valid = validateEthereumSignature(decodedMessage, signature, publicKey);
  }
  if (!valid) throw new Error("Invalid signature");

  const user = await getUser(id);

  if (!user) return res.status(403);

  setCookie(req, res, user.id as string);

  return res.json(user);
});

export default router;
