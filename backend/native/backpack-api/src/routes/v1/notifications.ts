import express from "express";
import { insertSubscription } from "../../db/preference";
import { getNotifications } from "../../db/notifications";
import { extractUserId } from "../../auth/middleware";
const router = express.Router();

router.post("/register", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid = req.id || "";
  const publicKey = req.body.publicKey || "";
  const subscription = req.body.subscription;

  await insertSubscription(publicKey, uuid, subscription);

  res.json({});
});

router.get("/", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid: string = req.id;
  //@ts-ignore
  const limit: string = req.query.limit || 10;
  //@ts-ignore
  const offset: string = req.query.offset || 0;
  const notifications = await getNotifications(
    uuid,
    parseInt(offset),
    parseInt(limit)
  );
  res.json({ notifications });
});

export default router;
