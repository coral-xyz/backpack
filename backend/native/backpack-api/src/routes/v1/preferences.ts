import { getPreferences, updatePreference } from "../../db/preference";

import express from "express";
import { extractUserId } from "../../auth/middleware";
const router = express.Router();

router.post("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid = req.id || "";
  const xnftId = req.body.xnftId;
  const preferences = req.body.preferences;

  updatePreference(xnftId, uuid, preferences)
    .then(() => res.json({}))
    .catch((e) => {
      console.log(e);
      res.status(503).json({ msg: "Internal server error" });
    });
});

router.get("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid = req.id || "";

  getPreferences(uuid)
    .then((xnftPreferences) => res.json({ xnftPreferences }))
    .catch((e) => {
      console.log(e);
      res.status(502).json({ msg: "Internal server error" });
    });
});

export default router;
