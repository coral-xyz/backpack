import express from "express";
import { insertSubscription, updatePreference } from "./db/preference";
import { getNotifications } from "./db/notifications";

const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/*+json" }));
app.use(bodyParser.raw({}));

app.post("/backpack-api/register", async (req, res) => {
  //TODO: Secure this
  const username = req.body.username || "";
  const publicKey = req.body.publicKey || "";
  const subscription = req.body.subscription;

  await insertSubscription(publicKey, username, subscription);

  res.json({});
});

// TODO: Add validation using zod
app.post("/preference", async (req, res) => {
  //TODO: Secure this
  const username = req.body.username || "";
  const xnftId = req.body.xnftId;
  const preferences = req.body.preferences;

  await updatePreference(xnftId, username, preferences);

  res.json({});
});

app.get("/notifications", async (req, res) => {
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

app.listen(process.env.PORT || 8080);
