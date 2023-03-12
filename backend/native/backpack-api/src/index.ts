import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { ZodError } from "zod";

import authenticateRouter from "./routes/v1/authenticate";
import barterRouter from "./routes/v1/barter";
import chatRouter from "./routes/v1/chats";
import dropzoneRouter from "./routes/v1/dropzone";
import friendsRouter from "./routes/v1/friends";
import inboxRouter from "./routes/v1/inbox";
import nftsRouter from "./routes/v1/nft";
import notificationRoutes from "./routes/v1/notifications";
import preferenceRoutes from "./routes/v1/preferences";
import proxyRouter from "./routes/v1/proxy";
import publicKeysRouter from "./routes/v1/public-keys";
import referralsRouter from "./routes/v1/referrals";
import s3Router from "./routes/v1/s3";
import txParsingRouter from "./routes/v1/tx-parsing";
import usersRouter from "./routes/v1/users";
import { zodErrorToString } from "./util";

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

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
app.use("/tx-parsing", txParsingRouter);
app.use("/users", usersRouter);
app.use(
  "/mobile-service-worker",
  createProxyMiddleware({
    target:
      "https://coral-xyz.github.io/backpack/background-scripts/85fa0c25/service-worker-loader.html",
    changeOrigin: false,
  })
);
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

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.use((err: any, _req: Request, res: Response) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: zodErrorToString(err),
    });
  } else {
    return res.status(500).json(err);
  }
});

const port = process.env.PORT || 8080;
app.listen(port);

console.log("Listening on port: ", port);

process.on("uncaughtException", function (err) {
  console.error(err);
  console.log("Caught exception: " + err);
});
