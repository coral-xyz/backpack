import type { RemoteUserData } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import express from "express";

import { ensureHasRoomAccess, extractUserId } from "../../auth/middleware";
import { getFriendshipStatus } from "../../db/friendships";
import { addNfts, getNftCollection, getNftMembers } from "../../db/nft";
import {
  getUsers,
  getUsersByPublicKeys,
  getUsersWithFriendshipStatus,
} from "../../db/users";
import { validateOwnership } from "../../utils/metaplex";

const router = express.Router();

router.post("/bulk", extractUserId, async (req, res) => {
  // @ts-ignore
  const userId: string = req.id;
  const nfts = req.body.nfts;
  const publicKey: string = req.body.publicKey;
  const users = await getUsersByPublicKeys([
    {
      blockchain: Blockchain.SOLANA,
      publicKey,
    },
  ]);
  if (users[0].user_id !== userId) {
    return res.status(403).json({
      msg: "User doesn't own this public key",
    });
  }

  const responses = await Promise.all(
    nfts.map((nft: { nftId: string; collectionId: string }) =>
      validateOwnership(nft.nftId, nft.collectionId, publicKey)
    )
  );

  await addNfts(
    publicKey,
    nfts.filter((_x: any, index: number) => responses[index])
  );
  res.json({});
});

router.get("/members", extractUserId, ensureHasRoomAccess, async (req, res) => {
  // @ts-ignore
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  // @ts-ignore
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;
  // @ts-ignore
  const collectionId: string = req.query.room;
  // @ts-ignore
  const uuid: string = req.id;
  // @ts-ignore
  const prefix: string = req.query.prefix || "";

  const { count, users } = await getNftMembers(
    collectionId,
    prefix,
    limit,
    offset
  );

  const memberFriendships: {
    id: string;
    areFriends: boolean;
    requested: boolean;
    remoteRequested: boolean;
  }[] = await getFriendshipStatus(
    users.map((x) => x.id as string),
    uuid
  );

  const members: RemoteUserData[] = users
    .filter((x) => x.id !== uuid)
    .map(({ id, username }) => {
      const friendship = memberFriendships.find((x) => x.id === id);

      return {
        id,
        username,
        image: `https://swr.xnfts.dev/avatars/${username}`,
        requested: friendship?.requested || false,
        remoteRequested: friendship?.remoteRequested || false,
        areFriends: friendship?.areFriends || false,
      };
    });

  res.json({
    members: members,
    count,
  });
});

export default router;
