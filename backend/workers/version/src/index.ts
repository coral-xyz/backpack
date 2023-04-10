import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json(
    {
      version: 1,
    },
    200
  );
});

export default app;
