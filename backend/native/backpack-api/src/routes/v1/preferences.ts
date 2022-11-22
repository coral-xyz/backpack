import { getPreferences, updatePreference } from "../../db/preference";

import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  //TODO: Secure this
  const username = req.body.username || "";
  const xnftId = req.body.xnftId;
  const preferences = req.body.preferences;

  await updatePreference(xnftId, username, preferences);

  res.json({});
});

router.get("/", async (req, res) => {
  //TODO: Secure this
  const username = req.body.username || "";

  const xnftPreferences = await getPreferences(username);

  res.json({ xnftPreferences });
});

export default router;
