import type { Blockchain } from "@coral-xyz/common";
import { getCreateMessage } from "@coral-xyz/common";
import { ethers } from "ethers";
import type { Request, Response } from "express";
import express from "express";
import jwt from "jsonwebtoken";

import { extractUserId, optionallyExtractUserId } from "../../auth/middleware";
import { setCookie } from "../../auth/util";
import {
  createUser,
  createUserPublicKey,
  deleteUserPublicKey,
  getUser,
  getUserByUsername,
  getUsersByPrefix,
} from "../../db/users";
import { getOrcreateXnftSecret } from "../../db/xnftSecrets";
import {
  BlockchainPublicKey,
  CreateUserWithKeyrings,
  validateEthereumSignature,
  validateSolanaSignature,
} from "../../validation/user";

const { base58 } = ethers.utils;

const router = express.Router();

router.get("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const usernamePrefix: string = req.query.usernamePrefix;
  // @ts-ignore
  const uuid = req.id as string;

  await getUsersByPrefix({ usernamePrefix, uuid })
    .then((users) => {
      res.json({
        users: users.map((user) => ({
          ...user,
          image: `https://avatars.xnfts.dev/v1/${user.username}`,
        })),
      });
    })
    .catch(() => {
      res.status(511).json({ msg: "Error while fetching users" });
    });
});

router.get("/jwt/xnft", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid = req.id as string;
  // @ts-ignore
  const xnftAddress: string = req.query.xnftAddress;
  const secret = await getOrcreateXnftSecret(xnftAddress);
  const signedJwt = await jwt.sign({ uuid: uuid }, secret);
  return res.json({ jwt: signedJwt });
});

/**
 * Create a new user.
 */
router.post("/", async (req, res) => {
  const { username, inviteCode, waitlistId, blockchainPublicKeys } =
    CreateUserWithKeyrings.parse(req.body);

  // Validate all the signatures
  for (const blockchainPublicKey of blockchainPublicKeys) {
    const signedMessage = getCreateMessage(blockchainPublicKey.publicKey);
    if (blockchainPublicKey.blockchain === "solana") {
      if (
        !validateSolanaSignature(
          Buffer.from(signedMessage, "utf8"),
          base58.decode(blockchainPublicKey.signature),
          base58.decode(blockchainPublicKey.publicKey)
        )
      ) {
        return res.status(500).json({ msg: "Invalid Solana signature" });
      }
    } else {
      if (
        !validateEthereumSignature(
          Buffer.from(signedMessage, "utf8"),
          blockchainPublicKey.signature,
          blockchainPublicKey.publicKey
        )
      ) {
        return res.status(500).json({ msg: "Invalid Ethereum signature" });
      }
    }
  }

  let user;
  try {
    user = await createUser(
      username,
      blockchainPublicKeys,
      inviteCode,
      waitlistId
    );
  } catch (error) {
    for (const _error of error.response.errors) {
      if (_error.extensions.code === "constraint-violation") {
        return res
          .status(409)
          .json({ msg: "Public key is in use on another account" });
      }
    }
  }

  if (user) {
    await setCookie(req, res, user.id as string);
  } else {
    return res.status(500).json({ msg: "Error creating user account" });
  }

  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const publicKeyStr = blockchainPublicKeys
        .map((b) => `${b.blockchain.substring(0, 3)}: ${b.publicKey}`)
        .join(", ");
      await fetch(process.env.SLACK_WEBHOOK_URL, {
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

  return res.json({ id: user.id, msg: "ok" });
});

/**
 * Get an existing user. Checks authenticated status if a JWT cookie is passed
 * with the request.
 */
router.get(
  "/:username",
  optionallyExtractUserId(false),
  async (req: Request, res: Response) => {
    const username = req.params.username;

    let user;

    if (req.id) {
      try {
        const userFromId = await getUser(req.id);
        if (userFromId && userFromId.username === username) {
          // User is authenticated as username
          user = userFromId;
        }
      } catch {
        // User not found or username did not match
      }
    }

    // Valid JWT, user is authenticated
    const isAuthenticated = !!user;

    // If no user id was found in the JWT, we are not authenticated but still
    // try and get the user details by username
    if (!user) {
      try {
        user = await getUserByUsername(username);
      } catch {
        return res.status(404).json({ msg: "User not found " });
      }
    }

    return res.json({
      ...user,
      isAuthenticated,
    });
  }
);

/**
 * Returns the user that is associated with the JWT in the cookie or query string.
 */
router.get(
  "/me",
  optionallyExtractUserId(true),
  async (req: Request, res: Response) => {
    if (req.id) {
      try {
        return res.json(await getUser(req.id));
      } catch {
        // User not found
      }
    }
    return res.status(404).json({ msg: "User not found" });
  }
);

/**
 * Delete a public key/blockchain from the currently authenticated user.
 */
router.delete(
  "/publicKeys",
  extractUserId,
  async (req: Request, res: Response) => {
    const { blockchain, publicKey } = BlockchainPublicKey.parse(req.body);
    await deleteUserPublicKey({
      userId: req.id!,
      blockchain: blockchain as Blockchain,
      publicKey,
    });
    return res.status(204).end();
  }
);

/**
 * Add a public key/blockchain to the currently authenticated user.
 */
router.post(
  "/publicKeys",
  extractUserId,
  async (req: Request, res: Response) => {
    const { blockchain, publicKey } = BlockchainPublicKey.parse(req.body);
    await createUserPublicKey({
      userId: req.id!,
      blockchain: blockchain as Blockchain,
      publicKey,
    });
    return res.status(201).end();
  }
);

export default router;
