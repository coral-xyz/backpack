/**
 *  Auth worker
 *
 *  POST /users - Creates a new user if all of the required data is valid
 *    { username:string; publicKey:PublicKeyString; inviteCode: uuid; waitlistId?: string; }
 */

import { PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import { decode } from "bs58";
import { Hono } from "hono";
import { sign } from "tweetnacl";
import { z, ZodError } from "zod";
import { Chain } from "./zeus";

// shared user object that is extended for each blockchain
const BaseCreateUser = z.object({
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
  waitlistId: z.optional(z.nullable(z.string())),
});

const CreateEthereumUser = BaseCreateUser.extend({
  publicKey: z.string().refine((str) => {
    try {
      ethers.utils.getAddress(str);
      return true;
    } catch (err) {}
    return false;
  }, "must be a valid Ethereum public key"),
  blockchain: z.literal("ethereum"),
});

const CreateSolanaUser = BaseCreateUser.extend({
  publicKey: z.string().refine((str) => {
    try {
      new PublicKey(str);
      return true;
    } catch (err) {}
    return false;
  }, "must be a valid Solana public key"),
  blockchain: z.literal("solana"),
});

const CreateUser = z.discriminatedUnion("blockchain", [
  CreateEthereumUser,
  CreateSolanaUser,
]);

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

app.get("/users/:username/info", async (c) => {
  const username = c.req.param("username");

  const chain = Chain(c.env.HASURA_URL, {
    headers: {
      Authorization: `Bearer ${c.env.JWT}`,
    },
  });

  const res = await chain("query")({
    auth_users: [
      {
        where: { username: { _eq: username } },
        limit: 1,
      },
      {
        pubkey: true,
        blockchain: true, // needed for recovery flow
      },
    ],
  });

  if (res.auth_users[0]?.pubkey) {
    return c.json(res.auth_users[0]);
  } else {
    return c.json({ message: "user not found" }, 404);
  }
});

app.get("/users/:username", async (c) => {
  const { username } = BaseCreateUser.pick({ username: true }).parse({
    username: c.req.param("username"),
  });

  // TODO: move below block into zod `refine` validation function
  try {
    const res = await fetch(
      `https://username-validator.backpack.workers.dev/${username}`
    );
    const { ok } = await res.json<{ ok: boolean }>();
    if (!ok || !res.ok) throw new Error("validation error");
  } catch (err) {
    return c.json({ message: "username not available" }, 409);
  }

  const chain = Chain(c.env.HASURA_URL, {
    headers: {
      Authorization: `Bearer ${c.env.JWT}`,
    },
  });

  const inviteCodeCheck = await chain("query")({
    invitations_aggregate: [
      {
        where: {
          id: { _eq: c.req.header("x-backpack-invite-code") },
          claimed_at: { _is_null: true },
        },
      },
      {
        aggregate: {
          count: [{ columns: ["id"] as any }, true],
        },
      },
    ],
  });
  if (inviteCodeCheck.invitations_aggregate?.aggregate?.count !== 1) {
    return c.json({ message: "error" }, 401);
  }

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

  const variables = CreateUser.parse({
    ...body,
    // set a default blockchain value for legacy clients (<= 0.2.0)
    blockchain: body.blockchain || "solana",
  });

  let isValidSignature = false;
  if (variables.blockchain === "solana") {
    isValidSignature = sign.detached.verify(
      Buffer.from(JSON.stringify(body), "utf8"),
      decode(c.req.header("x-backpack-signature")),
      decode(variables.publicKey)
    );
  } else if (variables.blockchain === "ethereum") {
    isValidSignature =
      ethers.utils.verifyMessage(
        Buffer.from(JSON.stringify(body), "utf8"),
        c.req.header("x-backpack-signature")
      ) === variables.publicKey;
  }

  if (!isValidSignature) {
    throw new Error("Invalid signature");
  }

  const chain = Chain(c.env.HASURA_URL, {
    headers: {
      Authorization: `Bearer ${c.env.JWT}`,
    },
  });

  const res = await chain("mutation")({
    insert_auth_users_one: [
      {
        object: {
          username: variables.username,
          invitation_id: variables.inviteCode,
          pubkey: variables.publicKey,
          waitlist_id: variables.waitlistId,
          blockchain: variables.blockchain,
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
