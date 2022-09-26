/**
 *  Auth worker
 *
 *  POST /users - Creates a new user if all of the required data is valid
 *    { username:string; publicKey:PublicKeyString; inviteCode: uuid; waitlistId?: string; }
 */

import { PublicKey } from "@solana/web3.js";
import { decode } from "bs58";
import { Hono } from "hono";
import { sign } from "tweetnacl";
import { z, ZodError } from "zod";
import { Chain } from "./zeus";

const RESERVED = ["admin", "support"];

const CreateUser = z.object({
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,15}$/,
      "must be 3-15 characters, lowercase, and can only contain only letters, numbers and underscores"
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
  waitlistId: z.optional(z.nullable(z.string())),
});

// ----- routing -----

const app = new Hono();

app.use("*", async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    return c.json(err, err instanceof ZodError ? 400 : 500);
  }
});

app.get("/users/:username", async (c) => {
  const { username } = CreateUser.pick({ username: true }).parse({
    username: c.req.param("username"),
  });

  if (RESERVED.includes(username)) {
    return c.json({ message: "username not available" }, 409);
  }

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
  const body = await c.req.json();
  const variables = CreateUser.parse(body);

  if (
    !sign.detached.verify(
      Buffer.from(JSON.stringify(body), "utf8"),
      decode(c.req.header("x-backpack-signature")),
      decode(variables.publicKey)
    )
  ) {
    throw new Error("Invalid signature");
  }

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
