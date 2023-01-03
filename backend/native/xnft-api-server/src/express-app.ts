import express from "express";
export const app = express();
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

import v1Routes from "./v1/index";

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/*+json" }));

app.use(bodyParser.raw({}));

app.use("/v1", v1Routes);

export default app;

process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
});
