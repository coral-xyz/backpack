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

import { extractUserId, optionallyExtractUserId } from "../../auth/middleware";
import { clearCookie, setJWTCookie } from "../../auth/util";
import { REFERRER_COOKIE_NAME } from "../../config";
import { getFriendshipStatus } from "../../db/friendships";
import {
  createUser,
  createUserPublicKey,
  deleteUserPublicKey,
  getUser,
  getUserByPublicKeyAndChain,
  getUserByUsername,
  getUsers,
  getUsersByPrefix,
  getUsersByPublicKeys,
  updateUserAvatar,
} from "../../db/users";
import { getOrcreateXnftSecret } from "../../db/xnftSecrets";
import { validatePulicKey } from "../../validation/publicKey";
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
  const limit: number = req.query.limit;

  const isSolPublicKey = validatePulicKey(usernamePrefix, "solana");
  const isEthPublicKey = validatePulicKey(usernamePrefix, "ethereum");

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

  const metadatas = await getUsers(users.map((x) => x.id));
  const usersWithFriendshipMetadata: RemoteUserData[] = users
    .filter((x) => x.id !== uuid)
    .map(({ id, username }) => {
      const friendship = friendships.find((x) => x.id === id);
      const public_keys = (metadatas.find((x) => x.id === id)?.public_keys ||
        []) as { blockchain: string; publicKey: string }[];

      return {
        id,
        username,
        image: `${AVATAR_BASE_URL}/${username}`,
        requested: friendship?.requested || false,
        remoteRequested: friendship?.remoteRequested || false,
        areFriends: friendship?.areFriends || false,
        searchedSolPubKey: isSolPublicKey ? usernamePrefix : undefined,
        searchedEthPubKey: isEthPublicKey ? usernamePrefix : undefined,
        public_keys,
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
  const { username, inviteCode, waitlistId, blockchainPublicKeys } =
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
      if (req.cookies.referrer) {
        return (await getUser(req.cookies.referrer))?.id as string;
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
    inviteCode,
    waitlistId,
    referrerId
  );

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
  const user = await getUser(remoteUserId);
  return res.json({ user });
});

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
        return res.status(404).json({ msg: "User not found" });
      }
    }

    return res.json({
      ...user,
      isAuthenticated,
    });
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

    await createUserPublicKey({
      userId: req.id!,
      blockchain: blockchain as Blockchain,
      publicKey,
    });

    return res.status(201).end();
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
  const users = await getUsers(req.body.uuids);
  return res.json({
    users: (users || []).map((user) => ({
      uuid: user.id,
      username: user.username,
      image: `${AVATAR_BASE_URL}/${user.username}`,
    })),
  });
});

export default router;
