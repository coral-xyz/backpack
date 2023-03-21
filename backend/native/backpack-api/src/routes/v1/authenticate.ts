import { ethers } from "ethers";
import express from "express";

import { clearCookie, setJWTCookie } from "../../auth/util";
import { getUser } from "../../db/users";
import { validateSignature } from "../../validation/signature";

const { base58 } = ethers.utils;

const router = express.Router();

router.delete("/", async (req, res) => {
  clearCookie(res, "jwt");
  return res.json({ msg: "ok" });
});

router.post("/", async (req, res) => {
  const { blockchain, signature, publicKey, message } = req.body;
  const decodedMessage = Buffer.from(base58.decode(message));

  const messagePrefix = "Backpack login ";
  if (!decodedMessage.toString().startsWith(messagePrefix)) {
    return res.status(403).json({ msg: "invalid signed message" });
  }

  const uuid = decodedMessage.toString().replace(messagePrefix, "");

  if (!validateSignature(decodedMessage, blockchain, signature, publicKey)) {
    return res.status(403).json({ msg: `Invalid ${blockchain} signature` });
  }

  let user;
  try {
    user = await getUser(uuid);
    // Make sure the user has the signing public key
    const hasPublicKey = user.publicKeys.find(
      ({ blockchain: b, publicKey: p }) => b === blockchain && p === publicKey
    );
    if (!hasPublicKey)
      return res
        .status(403)
        .json({ msg: "invalid signing public key for user" });
  } catch (error) {
    console.error(error);
    // User not found
    return res.status(403).json({ msg: "invalid user id" });
  }

  const jwt = await setJWTCookie(req, res, user.id as string);

  return res.json({ ...user, jwt });
});

export default router;
