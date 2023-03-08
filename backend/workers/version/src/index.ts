import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json(
    {
      version: 1,
    },
    200
  );
});

export default app;
