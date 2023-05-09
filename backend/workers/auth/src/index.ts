/**
 *  Auth worker
 */

import { Chain } from "@coral-xyz/zeus";
import { PublicKey } from "@solana/web3.js";
import { decode } from "bs58";
import { ethers } from "ethers";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z, ZodError } from "zod";

import { jwt } from "./jwt";
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

app.onError((err, c) => {
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
        where: {
          username: { _eq: username },
          public_keys: { is_primary: { _eq: true } },
        },
        limit: 1,
      },
      {
        public_keys: [
          {
            where: { is_primary: { _eq: true } },
          },
          {
            public_key: true,
            blockchain: true,
            is_primary: true,
          },
        ],
      },
    ],
  });

  if (!res.auth_users[0]?.public_keys) {
    return c.json({ message: "user not found" }, 404);
  }

  // Camelcase the response
  const response = {
    publicKeys: res.auth_users[0].public_keys.map((k) => ({
      ...k,
      publicKey: k.public_key,
    })),
  };

  // TODO remove the below after 0.4.0 is superceded in store
  // Add compatibility for 0.4.0 in response
  response["pubkey"] = res.auth_users[0].public_keys[0].public_key;
  response["blockchain"] = res.auth_users[0].public_keys[0].blockchain;
  response["publickeys"] = response.publicKeys;

  return c.json(response);
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

  const { username, inviteCode, waitlistId, blockchainPublicKeys } =
    CreateUserWithKeyrings.parse(body);

  // Validate all the signatures
  for (const blockchainPublicKey of blockchainPublicKeys) {
    if (blockchainPublicKey.blockchain === "solana") {
      if (
        !validateSolanaSignature(
          Buffer.from(inviteCode, "utf8"),
          decode(blockchainPublicKey.signature),
          decode(blockchainPublicKey.publicKey)
        )
      ) {
        throw new Error("Invalid Solana signature");
      }
    } else {
      if (
        !validateEthereumSignature(
          Buffer.from(inviteCode, "utf8"),
          blockchainPublicKey.signature,
          blockchainPublicKey.publicKey
        )
      ) {
        throw new Error("Invalid Ethereum signature");
      }
    }
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
          username: username,
          invitation_id: inviteCode,
          waitlist_id: waitlistId,
          public_keys: {
            data: blockchainPublicKeys.map((b) => ({
              blockchain: b.blockchain,
              public_key: b.publicKey,
            })),
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
      const publicKeyStr = blockchainPublicKeys
        .map((b) => `${b.blockchain.substring(0, 3)}: ${b.publicKey}`)
        .join(", ");
      await fetch(c.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: [username, publicKeyStr].join("\n"),
          icon_url: `https://swr.xnfts.dev/avatars/${username}`,
        }),
      });
    } catch (err) {
      console.error({ slackWebhook: err });
    }
  }

  return jwt(c, res.insert_auth_users_one);
});

registerOnRampHandlers(app);

export default app;
