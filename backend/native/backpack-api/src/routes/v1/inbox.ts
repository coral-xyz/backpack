import express from "express";
import { InboxDb, EnrichedInboxDb } from "@coral-xyz/common";
import { getUsers } from "../../db/users";
import { extractUserId } from "../../auth/middleware";
import { getFriendships } from "../../db/friendships";

const router = express.Router();

router.get("/", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid = req.id;
  //@ts-ignore
  const limit: number = req.query.limit || 50;
  //@ts-ignore
  const offset: number = req.query.limit || 0;
  const friendships = await getFriendships({ uuid, limit, offset });
  const enrichedFriendships = await enrichFriendships(friendships);
  res.json({ chats: enrichedFriendships });
});

async function enrichFriendships(
  friendships: InboxDb[]
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
    const user1Username =
      metadatas.find((x) => x.id === friendship.user1)?.username || "";
    const user2Username =
      metadatas.find((x) => x.id === friendship.user2)?.username || "";

    return {
      ...friendship,
      user1Username,
      user2Username,
      user1Image: `https://avatars.xnfts.dev/v1/${user1Username}`,
      user2Image: `https://avatars.xnfts.dev/v1/${user2Username}`,
    };
  });
}

export default router;
