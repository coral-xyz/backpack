import express from "express";
import { Chain } from "@coral-xyz/zeus";
import { sendNotification } from "./web-push";
import { HASURA_URL, JWT } from "./config";

const app = express();
const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/*+json" }));

// parse some custom thing into a Buffer
app.use(bodyParser.raw({}));

app.post("/notifications/register", async (req, res) => {
  const body = req.body;
  //TODO: Secure this
  const username = req.body.username || "";
  const publicKey = req.body.publicKey || "";
  const subscription = req.body.subscription;

  await chain("mutation")({
    insert_auth_notification_subscriptions_one: [
      {
        object: {
          public_key: publicKey,
          username,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          expirationTime: subscription.expirationTime || "",
        },
      },
      {
        id: true,
      },
    ],
  });

  res.json({});
});

app.get("/notification/notify", async (req, res) => {
  // TODO: secure this
  const username = req.query.username;
  console.log(username);

  const responses = await chain("query")({
    auth_notification_subscriptions: [
      {
        where: { username: { _eq: (username as string) || "" } },
        limit: 5,
      },
      {
        username: true,
        endpoint: true,
        expirationTime: true,
        p256dh: true,
        auth: true,
      },
    ],
  });
  responses.auth_notification_subscriptions.forEach(async (response) => {
    const subscription = {
      endpoint: response.endpoint,
      expirationTime: response.expirationTime || null,
      keys: {
        p256dh: response.p256dh,
        auth: response.auth,
      },
    };
    // @ts-ignore
    await sendNotification(subscription, "hi there");
  });

  return res.json({});
});

app.listen(process.env.PORT || 8080);
