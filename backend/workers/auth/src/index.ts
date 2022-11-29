/**
 *  Auth worker
 */

import { Chain } from "@coral-xyz/zeus";
import { PublicKey } from "@solana/web3.js";
import { decode } from "bs58";
import { ethers } from "ethers";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { importSPKI, jwtVerify } from "jose";
import { z, ZodError } from "zod";

import { alg, clearCookie, jwt } from "./jwt";
import { registerOnRampHandlers } from "./onramp";
import { zodErrorToString } from "./util";
import {
  validateEthereumSignature,
  validateSolanaSignature,
} from "./validation";

const BaseCreateUser = z.object({
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,15}$/,
      "should be between 3-15 characters and can only contain numbers, letters, and underscores."
    ),
  inviteCode: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      "is in an invalid format"
    ),
  waitlistId: z.optional(z.nullable(z.string())),
});

//
// User creation, with multiple blockchains and public keys
//

const CreateEthereumKeyring = z.object({
  publicKey: z.string().refine((str) => {
    try {
      ethers.utils.getAddress(str);
      return true;
    } catch {
      // Pass
    }
    return false;
  }, "must be a valid Ethereum public key"),
  blockchain: z.literal("ethereum"),
  signature: z.string(),
});

const CreateSolanaKeyring = z.object({
  publicKey: z.string().refine((str) => {
    try {
      new PublicKey(str);
      return true;
    } catch {
      // Pass
    }
    return false;
  }, "must be a valid Solana public key"),
  blockchain: z.literal("solana"),
  signature: z.string(),
});

const CreateKeyrings = z.discriminatedUnion("blockchain", [
  CreateEthereumKeyring,
  CreateSolanaKeyring,
]);

const CreateUserWithKeyrings = BaseCreateUser.extend({
  blockchainPublicKeys: CreateKeyrings.array(),
});

//
// Routing
//

const app = new Hono();

app.use("*", cors());

app.use("*", async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    if (err instanceof ZodError) {
      return c.json(
        {
          message: zodErrorToString(err),
        },
        400
      );
    } else {
      return c.json(err, 500);
    }
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
        publickeys: [{}, { blockchain: true, publickey: true }],
      },
    ],
  });

  if (res.auth_users[0]?.publickeys) {
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
    return c.json({ message: "Username is not available" }, 409);
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
    return c.json({ message: "Username available" });
  } else {
    return c.json({ message: "Username has already been claimed" }, 409);
  }
});

/**
 * Create a user.
 */
app.post("/users", async (c) => {
  const body = await c.req.json();

  let username: string,
    inviteCode: string,
    waitlistId: string | null | undefined,
    publicKeys: Array<{ blockchain: "ethereum" | "solana"; publickey: string }>;

  const data = CreateUserWithKeyrings.parse(body);
  for (const blockchainPublicKey of data.blockchainPublicKeys) {
    if (blockchainPublicKey.blockchain === "solana") {
      if (
        !validateSolanaSignature(
          Buffer.from(data.inviteCode, "utf8"),
          decode(blockchainPublicKey.signature),
          decode(blockchainPublicKey.publicKey)
        )
      ) {
        throw new Error("Invalid Solana signature");
      }
    } else {
      if (
        !validateEthereumSignature(
          Buffer.from(data.inviteCode, "utf8"),
          blockchainPublicKey.signature,
          blockchainPublicKey.publicKey
        )
      ) {
        throw new Error("Invalid Ethereum signature");
      }
    }
  }

  ({ username, inviteCode, waitlistId } = data);
  publicKeys = data.blockchainPublicKeys.map((b) => ({
    blockchain: b.blockchain,
    publickey: b.publicKey,
  }));

  const chain = Chain(c.env.HASURA_URL, {
    headers: {
      Authorization: `Bearer ${c.env.JWT}`,
    },
  });

  const res = await chain("mutation")({
    insert_auth_users_one: [
      {
        object: {
          username: username,
          invitation_id: inviteCode,
          waitlist_id: waitlistId,
          publickeys: {
            data: publicKeys!,
          },
        },
      },
      {
        id: true,
        username: true,
      },
    ],
  });

  if (!res.insert_auth_users_one)
    throw new Error("Error creating user account");

  if (c.env.SLACK_WEBHOOK_URL) {
    try {
      const publicKeyStr = publicKeys!
        .map((b) => `${b.blockchain.substring(0, 3)}: ${b.publickey}`)
        .join(", ");
      await fetch(c.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: [username, publicKeyStr].join("\n"),
          icon_url: `https://avatars.xnfts.dev/v1/${username}`,
        }),
      });
    } catch (err) {
      console.error({ slackWebhook: err });
    }
  }

  return jwt(c, res.insert_auth_users_one);
});

app.delete("/authenticate", (c) => {
  clearCookie(c, "jwt");
  return c.json({ msg: "ok" });
});

app.post("/authenticate", async (c) => {
  const body = await c.req.json();
  const sig = body.signature;
  const pk = body.publickey;
  const message = Buffer.from(decode(body.encodedMessage));
  const { id, username } = JSON.parse(body.message);

  let valid = false;
  if (body.blockchain === "solana") {
    valid = validateSolanaSignature(message, decode(sig), decode(pk));
  } else if (body.blockchain === "ethereum") {
    valid = validateEthereumSignature(message, sig, pk);
  }
  if (!valid) throw new Error("Invalid signature");

  const chain = Chain(c.env.HASURA_URL, {
    headers: {
      Authorization: `Bearer ${c.env.JWT}`,
    },
  });

  const res = await chain("query")({
    auth_users: [
      {
        where: {
          id: { _eq: id },
          username: { _eq: username },
          publickeys: {
            publickey: { _eq: body.publickey },
            blockchain: { _eq: body.blockchain },
          },
        },
        limit: 1,
      },
      {
        id: true,
        username: true,
      },
    ],
  });
  const [user] = res.auth_users;
  if (!user) throw new Error("user not found");

  return jwt(c, user);
});

app.post("/authenticate/:username", async (c) => {
  const username = c.req.param("username");
  const _jwt = c.req.cookie("jwt");

  if (_jwt) {
    try {
      const publicKey = await importSPKI(c.env.AUTH_JWT_PUBLIC_KEY, alg);
      const res = await jwtVerify(_jwt, publicKey, {
        issuer: "auth.xnfts.dev",
        audience: "backpack",
      });
      if (res.payload.username === username) {
        // update jwt cookie to push expiration date further into the future
        return jwt(c, { id: res.payload.sub, username });
      } else {
        throw new Error(`invalid username (${username})`);
      }
    } catch (err) {
      console.error(err);
      clearCookie(c, "jwt");
      return c.json({ msg: "invalid jwt cookie" }, 401);
    }
  } else {
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
          id: true,
          publickeys: [{}, { blockchain: true, publickey: true }],
        },
      ],
    });
    const user = res.auth_users?.[0];
    return user
      ? c.json(user)
      : c.json({ message: `username (${username}) not found` }, 404);
  }
});

/**
 * returns information about the user associated with the jwt that's
 * provided either by a ?jwt= querystring parameter or 'jwt' cookie
 */
app.get("/me", async (c) => {
  const jwt = c.req.query("jwt") || c.req.cookie("jwt");
  try {
    const publicKey = await importSPKI(c.env.AUTH_JWT_PUBLIC_KEY, alg);
    const { payload } = await jwtVerify(jwt, publicKey, {
      issuer: "auth.xnfts.dev",
      audience: "backpack",
    });
    const chain = Chain(c.env.HASURA_URL, {
      headers: {
        Authorization: `Bearer ${c.env.JWT}`,
      },
    });
    const res = await chain("query")({
      auth_users_by_pk: [
        {
          id: payload.sub,
        },
        {
          id: true,
          username: true,
          publickeys: [{}, { blockchain: true, publickey: true }],
        },
      ],
    });
    const user = res.auth_users_by_pk;
    if (!user) return c.json({ msg: `user not found (${payload.sub})` }, 404);
    return c.json(user);
  } catch (err) {
    console.error(err);
    return c.json({ msg: "invalid or missing jwt" }, 401);
  }
});

registerOnRampHandlers(app);

export default app;
