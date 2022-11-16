import express from "express";
import { insertSubscription, updatePreference } from "./db";

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

app.listen(process.env.PORT || 8080);
