/**
 *  Auth worker
 *
 *  POST /users - Creates a new user if all of the required data is valid
 *    { username:string; publicKey:PublicKeyString; inviteCode: uuid; waitlistId?: string; }
 */

import { Hono } from "hono";
import { z, ZodError } from "zod";
import { PublicKey } from "@solana/web3.js";
import { Chain } from "./zeus";

const CreateUser = z.object({
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{4,15}$/,
      "must be 4-15 characters, lowercase, and can only contain only letters, numbers and underscores"
    ),
  inviteCode: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      "invalid format"
    ),
  publicKey: z.string().refine((str) => {
    try {
      new PublicKey(str);
      return true;
    } catch (err) {}
    return false;
  }, "must be a valid Solana public key"),
  waitlistId: z.nullable(z.string()),
});

// ----- routing -----

const app = new Hono();

app.use("*", async (c, next) => {
  try {
    await next();
  } catch (err) {
    return c.json(err, err instanceof ZodError ? 400 : 500);
  }
});

app.get("/users/:username", async (c) => {
  const { username } = CreateUser.pick({ username: true }).parse({
    username: c.req.param("username"),
  });

  const chain = Chain(c.env.HASURA_URL, {
    headers: { "x-hasura-admin-secret": c.env.HASURA_SECRET },
  });

  const res = await chain("query")({
    auth_users_aggregate: [
      {
        where: { username: { _eq: username } },
      },
      {
        aggregate: {
          count: [{ columns: "id" as any }, true],
        },
      },
    ],
  });

  if (res.auth_users_aggregate?.aggregate?.count === 0) {
    return c.json({ message: "username available" });
  } else {
    return c.json({ message: "username not available" }, 409);
  }
});

app.post("/users", async (c) => {
  const variables = CreateUser.parse(await c.req.json());

  const chain = Chain(c.env.HASURA_URL, {
    headers: { "x-hasura-admin-secret": c.env.HASURA_SECRET },
  });

  const res = await chain("mutation")({
    insert_auth_users_one: [
      {
        object: {
          username: variables.username,
          invitation_id: variables.inviteCode,
          pubkey: variables.publicKey,
          waitlist_id: variables.waitlistId,
        },
      },
      {
        id: true,
      },
    ],
  });

  return c.json(res);
});

export default app;
