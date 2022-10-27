/**
 *  Auth worker
 *
 *  POST /users - Creates a new user if all of the required data is valid
 *    { username:string; publicKey:PublicKeyString; inviteCode: uuid; waitlistId?: string; }
 */

import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ethers } from "ethers";
import { decode } from "bs58";
import { Hono } from "hono";
import { sign } from "tweetnacl";
import { z, ZodError } from "zod";
import { Chain } from "./zeus";

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

//
// New user creation, with multiple blockchains and public keys
//

const CreateEthereumKeyring = z.object({
  publicKey: z.string().refine((str) => {
    try {
      ethers.utils.getAddress(str);
      return true;
    } catch (err) {}
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
    } catch (err) {}
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
// Legacy user creation, with one publicKey and blockchain per user.
// TODO
//

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

const LegacyCreateUser = z.discriminatedUnion("blockchain", [
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
        publickeys: [{}, { blockchain: true, publickey: true }],
      },
    ],
  });

  if (res.auth_users[0]?.publickeys) {
    return c.json({
      ...res.auth_users[0],
      // TODO remove
      // This is to not break legacy recovery flows
      pubkey: res.auth_users[0].publickeys[0].publickey,
      blockchain: res.auth_users[0].publickeys[0].blockchain,
    });
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
    return c.json({ message: "Username not available" }, 409);
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

  let username: string,
    inviteCode: string,
    waitlistId: string | null | undefined,
    publicKeys: Array<{ blockchain: "ethereum" | "solana"; publickey: string }>;

  // Try legacy onboarding
  const result = LegacyCreateUser.safeParse(body);
  if (result.success) {
    if (result.data.blockchain === "solana") {
      if (
        !validateSolanaSignature(
          // Legacy onboarding signs the whole body
          Buffer.from(JSON.stringify(body), "utf8"),
          decode(c.req.header("x-backpack-signature")),
          decode(result.data.publicKey)
        )
      ) {
        throw new Error("Invalid Solana signature");
      }
    } else {
      if (
        !validateEthereumSignature(
          // Legacy onboarding signs the whole body
          Buffer.from(JSON.stringify(body), "utf8"),
          c.req.header("x-backpack-signature"),
          result.data.publicKey
        )
      ) {
        throw new Error("Invalid Ethereum signature");
      }
    }
    // Legacy onboarding was successfully parsed
    ({ username, inviteCode, waitlistId } = result.data);
    // A single blockchain
    publicKeys = [
      { blockchain: result.data.blockchain, publickey: result.data.publicKey },
    ];
  } else {
    // New multichain onboarding
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
          publickeys: {
            data: publicKeys!,
          },
        },
      },
      {
        id: true,
      },
    ],
  });

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

  return c.json(res);
});

const validateEthereumSignature = (
  msg: Buffer,
  signature: string,
  publicKey: string
) => {
  return ethers.utils.verifyMessage(msg, signature) === publicKey;
};

const validateSolanaSignature = (
  msg: Buffer,
  signature: Uint8Array,
  publicKey: Uint8Array
) => {
  if (sign.detached.verify(msg, signature, publicKey)) {
    return true;
  }

  try {
    // This might be a Solana transaction because that is used for Ledger which
    // does not support signMessage
    const tx = new Transaction();
    tx.add(
      new TransactionInstruction({
        programId: new PublicKey(publicKey),
        keys: [],
        data: msg,
      })
    );
    tx.feePayer = new PublicKey(publicKey);
    // Not actually needed as it's not transmitted to the network
    tx.recentBlockhash = tx.feePayer.toString();
    tx.addSignature(new PublicKey(publicKey), Buffer.from(signature));
    return tx.verifySignatures();
  } catch (err) {
    console.error("dummy solana transaction error", err);
    return false;
  }
};

export default app;
