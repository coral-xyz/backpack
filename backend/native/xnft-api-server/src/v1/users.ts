import express from "express";
import { authMiddleware } from "../auth/middleware";
import { getUserIdFromPubkey } from "../db/users";

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
      res.status(411).json({ msg: "Failed to fetch user details" });
    });
});

export default router;
