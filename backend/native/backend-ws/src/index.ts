import { WebSocketServer } from "ws";
import { PORT } from "./config";
import { UserManager } from "./users/UserManager";
import { extractUserId } from "./auth";
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", async (ws, req) => {
  const cookie = req.headers.cookie;
  console.log(`cookie is ${cookie}`);
  const userId = await extractUserId(cookie || "");
  console.log(`userid is ${userId}`);
  UserManager.getInstance().addUser(
    ws,
    Math.floor(Math.random() * 10000000).toString(),
    userId || ""
  );
});

process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
});
