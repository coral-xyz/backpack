import { Hono } from "hono";
import { FEATURE_GATES } from "./FEATURES";
import { getStripeEnabledGate } from "./stripe";

const app = new Hono();

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
