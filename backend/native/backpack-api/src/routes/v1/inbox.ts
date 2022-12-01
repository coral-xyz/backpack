import express from "express";
import { InboxDb, EnrichedInboxDb } from "@coral-xyz/common";
import { getUsers } from "../../db/users";
import { extractUserId } from "../../auth/middleware";
import { getFriendships, getOrCreateFriendship } from "../../db/friendships";

const router = express.Router();

router.post("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const from: string = req.id;
  // @ts-ignore
  const to: string = req.body.to;
  if (!from || !to) {
    return res.status(411).json({ msg: "incorrect input" });
  }
  const friendshipId = await getOrCreateFriendship({ from, to });

  res.json({
    id: from,
    friendshipId,
  });
});

router.get("/", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid = req.id;
  //@ts-ignore
  const limit: number = req.query.limit || 50;
  //@ts-ignore
  const offset: number = req.query.limit || 0;
  const are_friends: boolean = req.query.areFriends ?? true;
  const friendships = await getFriendships({
    uuid,
    limit,
    offset,
    are_friends,
  });
  const enrichedFriendships = await enrichFriendships(friendships, uuid);
  res.json({ chats: enrichedFriendships });
});

async function enrichFriendships(
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
