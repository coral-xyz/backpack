import express from "express";
import { insertSubscription } from "../../db/preference";
import { getNotifications } from "../../db/notifications";
const router = express.Router();

router.post("/register", async (req, res) => {
  //TODO: Secure this
  const username = req.body.username || "";
  const publicKey = req.body.publicKey || "";
  const subscription = req.body.subscription;

  await insertSubscription(publicKey, username, subscription);

  res.json({});
});

router.get("/", async (req, res) => {
  // @TODO: secure this
  //@ts-ignore
  const username: string = req.query.username;
  //@ts-ignore
  const limit: string = req.query.limit || 10;
  //@ts-ignore
  const offset: string = req.query.offset || 0;
  const notifications = await getNotifications(
    username,
    parseInt(offset),
    parseInt(limit)
  );
  res.json({ notifications });
});

export default router;
