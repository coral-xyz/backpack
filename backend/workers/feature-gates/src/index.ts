import { Hono } from "hono";
import { FEATURE_GATES } from "./FEATURES";

const app = new Hono();

app.get("/", (c) => {
  return c.json("ok", 200);
});

app.get("/gates", async (c) => {
  return c.json({ gates: FEATURE_GATES }, 200);
});

export default app;
