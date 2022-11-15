import express from "express";
import webpush from "web-push";
import { deleteSubscription, getSubscriptions, insertSubscription } from "./db";
import {
  NOTIFICATION_SEND_SECRET,
  VAPID_PRIVATE_KEY,
  VAPID_PUBLIC_KEY,
} from "./config";

const app = express();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/*+json" }));

// parse some custom thing into a Buffer
app.use(bodyParser.raw({}));
const vapidKeys = {
  publicKey: VAPID_PUBLIC_KEY,
  privateKey: VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  "mailto:admin@200ms.io",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.post("/notifications/register", async (req, res) => {
  const body = req.body;
  //TODO: Secure this
  const username = req.body.username || "";
  const publicKey = req.body.publicKey || "";
  const subscription = req.body.subscription;

  await insertSubscription(publicKey, username, subscription);

  res.json({});
});

app.get("/notification/notify", async (req, res) => {
  // TODO: secure this
  const username = req.query.username;
  const secret = req.query.secret;

  if (secret !== NOTIFICATION_SEND_SECRET) {
    return res.status(411).json({});
  }

  const responses = await getSubscriptions(username as string);
  responses.auth_notification_subscriptions.map(async (response) => {
    const subscription = {
      endpoint: response.endpoint,
      expirationTime: response.expirationTime || null,
      keys: {
        p256dh: response.p256dh,
        auth: response.auth,
      },
    };
    try {
      // @ts-ignore
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "title1",
          body: "description1 " + Math.random(),
        })
      );
    } catch (e) {
      // @ts-ignore
      if (e?.statusCode === 410 && e.body?.includes("unsubscribed")) {
        await deleteSubscription(response.id);
      }
    }
  });

  return res.json({});
});

app.listen(process.env.PORT || 8080);
