import express from "express";
import notificationRoutes from "./routes/v1/notifications";
import preferenceRoutes from "./routes/v1/preferences";
import proxyRouter from "./routes/v1/proxy";
import chatRouter from "./routes/v1/chats";

const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/json" }));
app.use("/notifications/", notificationRoutes);
app.use("/preferences", preferenceRoutes);
app.use("/proxy", proxyRouter);
app.use("/chat", chatRouter);

// TODO: Add validation using zod

app.listen(process.env.PORT || 8080);

process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
});
