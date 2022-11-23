import { WebSocketServer } from "ws";
import url from "url";
import { PORT } from "./config";
import { UserManager } from "./users/UserManager";
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws, req) => {
  const url_parts = url.parse(req.url || "", true);
  const query = url_parts.query;
  UserManager.getInstance().addUser(
    ws,
    Math.floor(Math.random() * 10000000).toString(),
    query.userId || ""
  );
});
