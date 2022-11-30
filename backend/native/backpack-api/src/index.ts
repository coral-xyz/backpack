import express from "express";
import authenticateRouter from "./routes/v1/authenticate";
import notificationRoutes from "./routes/v1/notifications";
import preferenceRoutes from "./routes/v1/preferences";
import proxyRouter from "./routes/v1/proxy";
import userRouter from "./routes/v1/uers";
import chatRouter from "./routes/v1/chats";
import inboxRouter from "./routes/v1/inbox";
import friendsRouter from "./routes/v1/friends";
import usersRouter from "./routes/v1/users";

const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/json" }));
app.use("/authenticate", authenticateRouter);
app.use("/chat", chatRouter);
app.use("/notifications/", notificationRoutes);
app.use("/preferences", preferenceRoutes);
app.use("/proxy", proxyRouter);
app.use("/chat", chatRouter);
app.use("/inbox", inboxRouter);
app.use("/friends", friendsRouter);
app.use("/users", usersRouter);

// TODO: Add validation using zod

app.listen(process.env.PORT || 8080);

process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
});
