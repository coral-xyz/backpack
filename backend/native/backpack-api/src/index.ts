import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import { ZodError } from "zod";

import gqlRouter from "./routes/graphql";
import authenticateRouter from "./routes/v1/authenticate";
import barterRouter from "./routes/v1/barter";
import chatRouter from "./routes/v1/chats";
import dropzoneRouter from "./routes/v1/dropzone";
import friendsRouter from "./routes/v1/friends";
import inboxRouter from "./routes/v1/inbox";
import mobileRouter from "./routes/v1/mobile";
import nftsRouter from "./routes/v1/nft";
import notificationRoutes from "./routes/v1/notifications";
import preferenceRoutes from "./routes/v1/preferences";
import proxyRouter from "./routes/v1/proxy";
import publicKeysRouter from "./routes/v1/public-keys";
import referralsRouter from "./routes/v1/referrals";
import s3Router from "./routes/v1/s3";
import twitterRouter from "./routes/v1/twitter";
import txParsingRouter from "./routes/v1/tx-parsing";
import usersRouter from "./routes/v1/users";
import { zodErrorToString } from "./util";

export const app = express();

// eslint-disable-next-line
const bodyParser = require("body-parser");
// eslint-disable-next-line
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/json" }));
app.use("/authenticate", authenticateRouter);
app.use("/chat", chatRouter);
app.use("/dropzone", dropzoneRouter);
app.use("/friends", friendsRouter);
app.use("/inbox", inboxRouter);
app.use("/barter", barterRouter);
app.use("/nft", nftsRouter);
app.use("/notifications/", notificationRoutes);
app.use("/preferences", preferenceRoutes);
app.use("/proxy", proxyRouter);
app.use("/publicKeys", publicKeysRouter);
app.use("/referrals", referralsRouter);
app.use("/s3", s3Router);
app.use("/twitter", twitterRouter);
app.use("/tx-parsing", txParsingRouter);
app.use("/users", usersRouter);
app.use("/mobile", mobileRouter);
app.get("/_health", (_req, res) => {
  return res.status(200).json({
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  });
});

app.get("/", (_req, res) => {
  return res.status(200).json({
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  });
});

app.use("/v2", gqlRouter);

app.use(
  (
    err: any,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _DO_NOT_REMOVE_THIS_PARAMETER_: NextFunction
  ) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: zodErrorToString(err),
      });
    } else {
      return res.status(500).json(err);
    }
  }
);

const port = process.env.PORT || 8080;
app.listen(port);

console.log("Listening on port: ", port);

process.on("uncaughtException", function (err) {
  console.error(err);
  console.log("Caught exception: " + err);
});
