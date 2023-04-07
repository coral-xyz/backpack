import express from "express";

import { authMiddleware } from "../auth/middleware";
import { getUser, getUserFromUsername, getUserIdFromPubkey } from "../db/users";

const router = express.Router();

router.get("/fromPubkey", authMiddleware, async (req, res) => {
  const publicKey = req.query.publicKey as string;
  const blockchain = req.query.blockchain as string;

  try {
    const user = await getUserIdFromPubkey({ blockchain, publicKey });
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(411).json({ msg: "User not found" });
    }
  } catch (_err) {
    res.status(500).json({ msg: "Failed to fetch user details" });
  }
});

router.get("/fromUsername", authMiddleware, async (req, res) => {
  const username = req.query.username as string;

  try {
    const user = await getUserFromUsername({ username });
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(411).json({ msg: "User not found" });
    }
  } catch (_err) {
    res.status(500).json({ msg: "Failed to fetch user details" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const id = req.query.user_id as string;

  try {
    const user = await getUser(id);
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(411).json({ msg: "User not found" });
    }
  } catch (_err) {
    res.status(500).json({ msg: "Failed to fetch user details" });
  }
});

export default router;
