import { WebSocketServer } from "ws";
import { PORT } from "./config";
import { UserManager } from "./users/UserManager";
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws, req) => {
  const cookies = req.headers.cookie;

  UserManager.getInstance().addUser(
    ws,
    Math.floor(Math.random() * 10000000).toString(),
    "123"
  );
});
