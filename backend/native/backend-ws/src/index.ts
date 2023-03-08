import express from "express";
import http from "http";
import url from "url";
import { WebSocketServer } from "ws";

import { RedisSubscriptionManager } from "./subscriptions/RedisSubscriptionManager";
import { UserManager } from "./users/UserManager";
import { extractUserId } from "./auth";
import { PORT } from "./config";

const app = express();
const port = PORT || 3000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
app.get("/healthcheck", (req, res) => res.json({}));
app.get("/", (_req, res) => {
  return res.status(200).json({
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  });
});
app.get("/cookie", (req, res) => {
  const cookie = req.headers.cookie || "";
  if (cookie) {
    try {
      let jwt = "";
      cookie.split(";").forEach((item) => {
        const cookie = item.trim().split("=");
        if (cookie[0] === "jwt") {
          jwt = cookie[1];
        }
      });
      res.json({ jwt });
    } catch (e) {
      res.json({ jwt: "" });
    }
  }
});

wss.on("connection", async (ws, req) => {
  const url_parts = url.parse(req.url || "", true);
  const query = url_parts.query;
  // @ts-ignore
  const jwt: string = query.jwt;
  const userId = await extractUserId(jwt || "");
  console.log(`userid is ${userId}`);
  if (!userId) {
    ws.close();
    return;
  }
  UserManager.getInstance().addUser(
    ws,
    Math.floor(Math.random() * 10000000).toString(),
    userId || ""
  );
});

process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
});

server.listen(port);

console.log(`listening on port ${port}`);
const instance = RedisSubscriptionManager.getInstance();
