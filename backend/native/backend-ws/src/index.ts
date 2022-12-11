import { WebSocketServer } from "ws";
import { PORT } from "./config";
import { UserManager } from "./users/UserManager";
import { extractUserId } from "./auth";
import express from "express";
import http from "http";
import url from "url";

const app = express();
const port = PORT || 3000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
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
  const jwt = query.jwt;
  const userId = await extractUserId(jwt || "");
  console.log(`userid is ${userId}`);
  if (!userId) {
    ws.close();
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
