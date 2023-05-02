import type { RemoteUserData } from "@coral-xyz/common";
import {
  AVATAR_BASE_URL,
  Blockchain,
  getAddMessage,
  getCreateMessage,
} from "@coral-xyz/common";
import type { Request, Response } from "express";
import express from "express";
import jwt from "jsonwebtoken";

import {
  ensureHasPubkeyAccessBody,
  extractUserId,
} from "../../auth/middleware";
import { clearCookie, setJWTCookie, validateJwt } from "../../auth/util";
import { REFERRER_COOKIE_NAME } from "../../config";
import { getFriendshipStatus } from "../../db/friendships";
import { getPublicKeyDetails, updatePublicKey } from "../../db/publicKey";
import {
  createUser,
  createUserPublicKey,
  deleteUserPublicKey,
  getReferrer,
  getUser,
  getUserByPublicKeyAndChain,
  getUserByUsername,
  getUsersByPrefix,
  getUsersByPublicKeys,
  getUsersMetadata,
  updateUserAvatar,
} from "../../db/users";
import { getOrcreateXnftSecret } from "../../db/xnftSecrets";
import { logger } from "../../logger";
import { validatePublicKey } from "../../validation/publicKey";
import { validateSignature } from "../../validation/signature";
import {
  BlockchainPublicKey,
  CreatePublicKeys,
  CreateUserWithPublicKeys,
} from "../../validation/user";

const router = express.Router();

router.get("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const usernamePrefix: string = req.query.usernamePrefix;
  // @ts-ignore
  const uuid = req.id as string;
  // @ts-ignore
  const limit: number = req.query.limit ? parseInt(req.query.limit) : 20;

  const isSolPublicKey = validatePublicKey(usernamePrefix, "solana");
  const isEthPublicKey = validatePublicKey(usernamePrefix, "ethereum");

  let users;
  if (isSolPublicKey) {
    users = await getUserByPublicKeyAndChain(usernamePrefix, Blockchain.SOLANA);
  } else if (isEthPublicKey) {
    users = await getUserByPublicKeyAndChain(
      usernamePrefix,
      Blockchain.ETHEREUM
    );
  } else {
    users = await getUsersByPrefix({ usernamePrefix, uuid, limit });
  }

  const friendships: {
    id: string;
    areFriends: boolean;
    requested: boolean;
    remoteRequested: boolean;
  }[] = await getFriendshipStatus(
    users.map((x) => x.id as string),
    uuid
  );

  const usersWithFriendshipMetadata: RemoteUserData[] = users
    .filter((x) => x.id !== uuid)
    .map(({ id, username, public_keys }) => {
      const friendship = friendships.find((x) => x.id === id);

      return {
        id,
        username,
        image: `${AVATAR_BASE_URL}/${username}`,
        requested: friendship?.requested || false,
        remoteRequested: friendship?.remoteRequested || false,
        areFriends: friendship?.areFriends || false,
        searchedSolPubKey: isSolPublicKey ? usernamePrefix : undefined,
        searchedEthPubKey: isEthPublicKey ? usernamePrefix : undefined,
        // TODO: fix the disambiguation with snake_case and camelCase in API responses
        public_keys: public_keys.map((pk) => ({
          ...pk,
          publicKey: pk.public_key,
        })),
      };
    });

  res.json({
    users: usersWithFriendshipMetadata,
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
  const { username, waitlistId, blockchainPublicKeys } =
    CreateUserWithPublicKeys.parse(req.body);

  // Validate all the signatures
  for (const blockchainPublicKey of blockchainPublicKeys) {
    const signedMessage = getCreateMessage(blockchainPublicKey.publicKey);
    if (
      !validateSignature(
        Buffer.from(signedMessage, "utf-8"),
        blockchainPublicKey.blockchain as Blockchain,
        blockchainPublicKey.signature,
        blockchainPublicKey.publicKey
      )
    ) {
      return res
        .status(400)
        .json({ msg: `Invalid ${blockchainPublicKey.blockchain} signature` });
    }
  }

  // Check for conflicts
  const conflictingUsers = await getUsersByPublicKeys(
    blockchainPublicKeys.map((b) => ({
      blockchain: b.blockchain as Blockchain,
      publicKey: b.publicKey,
    }))
  );
  if (conflictingUsers.length > 0) {
    // Another user already uses this public key
    return res.status(409).json({
      msg: "Wallet address is used by another Backpack account",
    });
  }

  const referrerId = await (async () => {
    try {
      if (req.cookies[REFERRER_COOKIE_NAME]) {
        // Store the referrer if the cookie is valid
        return (await getUser(req.cookies[REFERRER_COOKIE_NAME]))?.id as string;
      } else {
        // Pass on the referrer of the current user
        const jwt = req.cookies.jwt;
        if (jwt) {
          const { payload } = await validateJwt(jwt);
          if (payload.sub) {
            const referrer = await getReferrer(payload.sub);
            if (referrer) return referrer.id as string;
          }
        }
      }
    } catch (err) {
      // TODO: log this failed referral
    }
    return undefined;
  })();

  const user = await createUser(
    username,
    blockchainPublicKeys.map((b) => ({
      ...b,
      // Cast blockchain to correct type
      blockchain: b.blockchain as Blockchain,
    })),
    waitlistId,
    referrerId
  );

  user?.public_keys.map(async ({ blockchain, id }) => {
    //TODO: make a bulk, single call here
    await updatePublicKey({
      userId: user.id,
      blockchain,
      publicKeyId: id,
    });
  });
  let jwt: string;
  if (user) {
    jwt = await setJWTCookie(req, res, user.id as string);
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
          icon_url: `${AVATAR_BASE_URL}/${username}`,
        }),
      });
    } catch (err) {
      console.error({ slackWebhook: err });
    }
  }

  clearCookie(res, REFERRER_COOKIE_NAME);

  return res.json({ id: user.id, msg: "ok", jwt });
});

/**
 * Fetches User detail by id
 */
router.get("/userById", extractUserId, async (req: Request, res: Response) => {
  //@ts-ignore
  const remoteUserId: string = req.query.remoteUserId;
  const user = await getUser(remoteUserId, true);
  return res.json({ user });
});

/**
 * Returns the user that is associated with the JWT in the cookie or query string.
 */
router.get("/me", extractUserId, async (req: Request, res: Response) => {
  if (req.id) {
    try {
      return res.json({ ...(await getUser(req.id)), jwt: req.jwt });
    } catch {
      // User not found
    }
  }
  return res.status(404).json({ msg: "User not found" });
});

router.get("/primarySolPubkey/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(411).json({ msg: "User not found" });
    }
    const pubKey = user.publicKeys.find(
      (x) => x.blockchain === Blockchain.SOLANA && x.primary
    );
    if (!pubKey)
      return res
        .status(411)
        .json({ msg: "No active pubkey on SOL for this user" });

    return res.json({
      publicKey: pubKey.publicKey,
    });
  } catch (e) {
    return res.status(411).json({ msg: "User not found" });
  }
});

/**
 * Returns the primary public keys of the user with `username`.
 */
router.get("/:username", async (req: Request, res: Response) => {
  const username = req.params.username;
  try {
    const user = await getUserByUsername(username);
    return res.json({
      id: user.id,
      publicKeys: user.publicKeys.filter((k) => k.primary),
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ msg: "User not found" });
  }
});

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
    const { blockchain, publicKey, signature } = CreatePublicKeys.parse(
      req.body
    );

    const signedMessage = getAddMessage(publicKey);

    if (
      !validateSignature(
        Buffer.from(signedMessage, "utf-8"),
        blockchain as Blockchain,
        signature,
        publicKey
      )
    ) {
      return res.status(400).json({ msg: `Invalid signature` });
    }

    const conflictingUsers = await getUsersByPublicKeys([
      { blockchain: blockchain as Blockchain, publicKey },
    ]);
    if (conflictingUsers.length > 0) {
      if (conflictingUsers[0].user_id === req.id) {
        // User already has the public key added, not a real conflict and
        // nothing to do
        return res.status(204).end();
      } else {
        // A proper conflict
        return res.status(409).json({
          msg: "Wallet address is used by another Backpack account",
        });
      }
    }

    const userPubkeyRes = await createUserPublicKey({
      userId: req.id!,
      blockchain: blockchain as Blockchain,
      publicKey,
    });

    return res.status(201).json({
      isPrimary: userPubkeyRes.isPrimary || false,
    });
  }
);

/**
 * Update avatar of the currently authenticated user.
 */
router.post("/avatar", extractUserId, async (req: Request, res: Response) => {
  await updateUserAvatar({
    userId: req.id!,
    avatar: req.body.avatar,
  });

  return res.status(201).end();
});

router.post("/metadata", async (req: Request, res: Response) => {
  const users = await getUsersMetadata(req.body.uuids);
  return res.json({
    users: (users || []).map((user) => ({
      uuid: user.id,
      username: user.username,
      image: `${AVATAR_BASE_URL}/${user.username}`,
    })),
  });
});

/**
 * Update the public key for the authenticated user.
 */
router.post(
  "/activePubkey",
  extractUserId,
  ensureHasPubkeyAccessBody,
  async (req: Request, res: Response) => {
    const publicKey: string = req.body.publicKey;
    const userId: string = req.id!;

    //TODO: optimise this to a single call
    const publicKeyDetails = await getPublicKeyDetails({ publicKey });
    if (!publicKeyDetails.id) {
      logger.log(
        `Public key not found in the DB ${publicKey}, user trying ${userId}`
      );
    }

    await updatePublicKey({
      userId: userId,
      blockchain: publicKeyDetails.blockchain,
      publicKeyId: publicKeyDetails.id,
    });

    return res.json({});
  }
);

export default router;
