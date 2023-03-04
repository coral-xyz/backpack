import express from "express";

import { authMiddleware } from "../auth/middleware";
import { getUser, getUserFromUsername, getUserIdFromPubkey } from "../db/users";

const router = express.Router();

router.get("/fromPubkey", authMiddleware, async (req, res) => {
  // @ts-ignore
  const publicKey: string = req.query.publicKey;
  // @ts-ignore
  const blockchain: string = req.query.blockchain;

  await getUserIdFromPubkey({ blockchain, publicKey })
    .then((user) => {
      if (user) {
        res.status(200).json({ user });
      } else {
        res.status(411).json({ msg: "User not found" });
      }
    })
    .catch((e) => {
      res.status(500).json({ msg: "Failed to fetch user details" });
    });
});

router.get("/fromUsername", authMiddleware, async (req, res) => {
  // @ts-ignore
  const username: string = req.query.username;

  await getUserFromUsername({ username })
    .then((user) => {
      if (user) {
        res.status(200).json({ user });
      } else {
        res.status(411).json({ msg: "User not found" });
      }
    })
    .catch((e) => {
      res.status(500).json({ msg: "Failed to fetch user details" });
    });
});

router.get("/", authMiddleware, async (req, res) => {
  // @ts-ignore
  const id: string = req.query.user_id;

  await getUser(id)
    .then((user) => {
      if (user) {
        res.status(200).json({ user });
      } else {
        res.status(411).json({ msg: "User not found" });
      }
    })
    .catch((e) => {
      res.status(500).json({ msg: "Failed to fetch user details" });
    });
});

export default router;
