import { Hono } from "hono";
import { cors } from "hono/cors";
import { importSPKI, jwtVerify } from "jose";

import { FEATURE_GATES } from "./FEATURES";
import { getStripeEnabledGate } from "./stripe";

type Env = {
  AUTH_JWT_PUBLIC_KEY: string;
  DROPZONE_USERS: string;
  STRIPE_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

app.get("/", (c) => {
  return c.json("ok", 200);
});

app.get("/gates", async (c) => {
  // Extract the user id to conditionally set feature gates
  const userIdFromJWT = await (async () => {
    try {
      const jwt = await jwtVerify(
        c.req.cookie("jwt")!,
        await importSPKI(c.env.AUTH_JWT_PUBLIC_KEY, "RS256"),
        {
          issuer: "auth.xnfts.dev",
          audience: "backpack",
        }
      );
      return jwt.payload.sub;
    } catch (err) {
      console.error(err);
    }
  })();

  return c.json(
    {
      gates: {
        ...FEATURE_GATES({
          userId: userIdFromJWT,
          // TODO: move this to proper storage
          dropzoneUsers: String(c.env.DROPZONE_USERS)
            .split(",")
            .filter(Boolean),
        }),
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
