import { Hono } from "hono";
import { cors } from "hono/cors";

import { FEATURE_GATES } from "./FEATURES";
import { getStripeEnabledGate } from "./stripe";

type Env = {
  STRIPE_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

app.get("/", (c) => {
  return c.json("ok", 200);
});

app.get("/gates", async (c) => {
  return c.json(
    {
      gates: {
        ...FEATURE_GATES,
        STRIPE_ENABLED: await getStripeEnabledGate(
          c.req.headers.get("x-real-ip") || "127.0.0.1",
          c.env.STRIPE_SECRET
        ),
      },
    },
    200
  );
});

export default app;
