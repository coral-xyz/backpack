import type { EnrichedInboxDb, InboxDb } from "@coral-xyz/common";
import express from "express";

import { extractUserId } from "../../auth/middleware";
import { getFriendships, getOrCreateFriendship } from "../../db/friendships";
import { getUsers } from "../../db/users";

const router = express.Router();

router.post("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const from: string = req.id;
  // @ts-ignore
  const to: string = req.body.to;
  if (!from || !to) {
    return res.status(411).json({ msg: "incorrect input" });
  }
  const friendship = await getOrCreateFriendship({ from, to });

  res.json({
    id: from,
    friendshipId: friendship.id,
    areFriends: friendship.are_friends,
    requested: friendship.requested,
    spam: friendship.spam,
    blocked: friendship.blocked,
  });
});

router.get("/", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid = req.id;
  //@ts-ignore
  const limit: number = req.query.limit || 50;
  //@ts-ignore
  const offset: number = req.query.limit || 0;
  const areConnected: boolean =
    req.query.areConnected === "true" ? true : false;
  const { friendships, requestCount } = await getFriendships({
    uuid,
    limit,
    offset,
    areConnected,
  });
  const enrichedFriendships = await enrichFriendships(friendships, uuid);
  res.json({ chats: enrichedFriendships, requestCount });
});

export async function enrichFriendships(
  friendships: InboxDb[],
  uuid: string
): Promise<EnrichedInboxDb[]> {
  const userIds: string[] = [
    ...friendships.map((m) => m.user1 || ""),
    ...friendships.map((m) => m.user2 || ""),
  ];
  const uniqueUserIds = userIds.filter(
    (x, index) => userIds.indexOf(x) === index
  );
  const metadatas = await getUsers(uniqueUserIds);
  return friendships.map((friendship) => {
    const remoteUserId =
      friendship.user1 === uuid ? friendship.user2 : friendship.user1;
    const remoteUsername =
      metadatas.find((x) => x.id === remoteUserId)?.username || "";

    return {
      ...friendship,
      remoteUserId,
      remoteUsername,
      remoteUserImage: `https://avatars.xnfts.dev/v1/${remoteUsername}`,
    };
  });
}

export default router;
