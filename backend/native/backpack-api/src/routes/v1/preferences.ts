import { getPreferences, updatePreference } from "../../db/preference";

import express from "express";
import { extractUserId } from "../../auth/middleware";
const router = express.Router();

router.post("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid = req.id || "";
  const xnftId = req.body.xnftId;
  const preferences = req.body.preferences;

  await updatePreference(xnftId, uuid, preferences);

  res.json({});
});

router.get("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid = req.id || "";

  const xnftPreferences = await getPreferences(uuid);

  res.json({ xnftPreferences });
});

export default router;
