import express from "express";

import { extractUserId } from "../../auth/middleware";
import {
  deleteSubscriptions,
  getNotifications,
  getSubscriptions,
  getUnreadCount,
  updateCursor,
  updateNotificationSeen,
} from "../../db/notifications";
import { insertSubscription } from "../../db/preference";
const router = express.Router();

router.post("/register", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid = req.id || "";
  const publicKey = req.body.publicKey || "";
  const subscription = req.body.subscription;

  await insertSubscription(publicKey, uuid, subscription);

  res.json({});
});

router.delete("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid = req.id || "";
  await deleteSubscriptions({ uuid });
  res.json({});
});

router.get("/subscriptions", extractUserId, async (req, res) => {
  const uuid = req.id || "";
  const subscriptions = await getSubscriptions({ uuid });
  res.json(subscriptions);
});

router.get("/unreadCount", extractUserId, async (req, res) => {
  const uuid = req.id || "";
  const unreadCount = await getUnreadCount({ uuid });
  res.json({
    unreadCount,
  });
});

router.post("/seen", extractUserId, async (req, res) => {
  const uuid = req.id || "";
  const notificationIds = req.body.notificationIds || "";

  await updateNotificationSeen({
    notificationIds,
    uuid,
  });
  res.json({});
});

router.put("/cursor", extractUserId, async (req, res) => {
  const uuid = req.id || "";
  const lastNotificationId = req.body.lastNotificationId;
  await updateCursor({ uuid, lastNotificationId });
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
