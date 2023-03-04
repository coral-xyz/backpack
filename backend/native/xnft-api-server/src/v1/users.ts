import express from "express";

import { authMiddleware } from "../auth/middleware";
import { getUser, getUserFromUsername, getUserIdFromPubkey } from "../db/users";

const router = express.Router();

router.get("/fromPubkey", authMiddleware, async (req, res) => {
  return res.json({});
});

router.get("/fromUsername", authMiddleware, async (req, res) => {
  return res.json({});
});

router.get("/", authMiddleware, async (req, res) => {
  return res.json({});
});

export default router;
