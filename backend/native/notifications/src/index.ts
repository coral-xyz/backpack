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

const memoryDb = {
  subscription: null,
};

app.post("/notifications/register", async (req, res) => {
  const body = req.body;
  //TODO: Secure this
  const username = req.body.username;
  const publicKey = req.body.publicKey;
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
          expirationTime: subscription.subscription,
        },
      },
      {
        id: true,
      },
    ],
  });

  memoryDb.subscription = body.subscription;
  res.json({});
});

app.get("/notification/notify", async (req, res) => {
  const username = req.body.username;

  const responses = await chain("query")({
    auth_notification_subscriptions: [
      {
        where: { username: { _eq: username } },
        limit: 5,
      },
      {},
    ],
  });
  responses.auth_notification_subscriptions.forEach(async (response) => {
    const subscription = {
      endpoint: response.endpoint,
      expirationTime: response.expiration_time,
      keys: {
        p256dh: response.p256dh,
        auth: response.auth,
      },
    };
    // @ts-ignore
    await sendNotification(subscription, "hi there");
  });
  // // @ts-ignore
  // sendNotification(memoryDb.subscription || {
  //     endpoint: 'https://fcm.googleapis.com/fcm/send/eLtamiY57-k:APA91bGNDGp6RUGJH9o_lQP5BFZ-vGqwRCLVwWfV-MkcY6FNSbbBfqnQ6glFNYLTedPPHH0MEW7JK4N6r_WPiMsdlgyVBpeV5wSybpj_KFzQzHmu01f6TG_23w1GaCB57JNc3wdfG-T8',
  //     expirationTime: null,
  //     keys: {
  //         p256dh: 'BO0mwX7gfFa2h7KaaTC6aPFqCDKXoarU2I8nsbckZ0hR1wSlm9PtVNF4IJy8m3IEIDuE7Fzv-XL_Sw0rmHySgvc',
  //         auth: '2kimLlqrCxx6JCCkXQojag'
  //     }
  // }, "hi there");
  return res.json({});
});

app.listen(process.env.PORT || 8080);
