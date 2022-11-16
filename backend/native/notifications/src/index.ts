import express from "express";
import { insertSubscription } from "./db";

const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/*+json" }));
app.use(bodyParser.raw({}));

app.post("/notifications/register", async (req, res) => {
  const body = req.body;
  //TODO: Secure this
  const username = req.body.username || "";
  const publicKey = req.body.publicKey || "";
  const subscription = req.body.subscription;

  await insertSubscription(publicKey, username, subscription);

  res.json({});
});

app.listen(process.env.PORT || 8080);
