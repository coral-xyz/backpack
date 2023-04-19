import type { EnrichedInboxDb, InboxDb } from "@coral-xyz/common";
import { AVATAR_BASE_URL } from "@coral-xyz/common";
import express from "express";

import { extractUserId } from "../../auth/middleware";
import {
  getAllFriendships,
  getFriendships,
  getOrCreateFriendship,
} from "../../db/friendships";
import { getUsers } from "../../db/users";

const router = express.Router();

router.post("/", extractUserId, async (req, res) => {
  const from = req.id!;
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
    remoteRequested: friendship.remote_requested,
    spam: friendship.spam,
    blocked: friendship.blocked,
  });
});

router.get("/", extractUserId, async (req, res) => {
  const uuid = req.id!;
  const limit = Math.min(Number(req.query.limit || 50), 100);
  const offset = Number(req.query.limit || 0);
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

router.get("/all", extractUserId, async (req, res) => {
  const uuid = req.id!;
  const limit = Number(req.query.limit || 50); // not currently used
  const offset = Number(req.query.limit || 0);
  const userSpecifiedId = req.query.uuid as string;

  if (uuid !== userSpecifiedId) {
    return res.json({ chats: [] });
  }

  const { friendships, friendRequests } = await getAllFriendships({
    uuid,
    limit,
    offset,
  });

  const enrichedFriendships = await enrichFriendships(
    friendships,
    friendRequests,
    uuid
  );
  res.json({ chats: enrichedFriendships });
});

export async function enrichFriendships(
  friendships: InboxDb[],
  friendRequests: { id: string; from: string; to: string }[],
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
    const localUserId =
      friendship.user1 === uuid ? friendship.user1 : friendship.user2;
    const spam =
      friendship.user1 === uuid
        ? friendship.user1_spam_user2
        : friendship.user2_spam_user1;
    const blocked =
      friendship.user1 === uuid
        ? friendship.user1_blocked_user2
        : friendship.user2_blocked_user1;

    const interacted =
      friendship.user1 === uuid
        ? friendship.user1_interacted
        : friendship.user2_interacted;

    const requested = friendRequests.find(
      ({ from, to }) => from === localUserId && to === remoteUserId
    );
    const remoteRequested = friendRequests.find(
      ({ from, to }) => to === localUserId && from === remoteUserId
    );

    const remoteInteracted =
      friendship.user1 === uuid
        ? friendship.user2_interacted
        : friendship.user1_interacted;

    const remoteUsername =
      (metadatas.find((x) => x.id === remoteUserId)?.username as string) || "";

    const public_keys = (metadatas.find((x) => x.id === remoteUserId)
      ?.publicKeys || []) as { blockchain: string; publicKey: string }[];

    const unread =
      friendship.last_message_sender === remoteUserId &&
      friendship.last_message_client_uuid !==
        (friendship.user1 === uuid
          ? friendship.user1_last_read_message_id
          : friendship.user2_last_read_message_id);

    return {
      id: friendship.id,
      friendshipId: friendship.id,
      last_message: friendship.last_message,
      public_keys: public_keys,
      last_message_timestamp: friendship.last_message_timestamp,
      last_message_sender: friendship.last_message_sender,
      user1: friendship.user1,
      user2: friendship.user2,
      are_friends: friendship.are_friends,
      last_message_client_uuid: friendship.last_message_client_uuid,
      user1_last_read_message_id: friendship.user1_last_read_message_id,
      user2_last_read_message_id: friendship.user2_last_read_message_id,
      areFriends: friendship.are_friends ? 1 : 0,
      remoteUserId,
      remoteUsername,
      remoteUserImage: `${AVATAR_BASE_URL}/${remoteUsername}`,
      spam: spam ? 1 : 0,
      blocked: blocked ? 1 : 0,
      interacted: interacted ? 1 : 0,
      remoteInteracted: remoteInteracted ? 1 : 0,
      unread: unread ? 1 : 0,
      requested: requested ? 1 : 0,
      remoteRequested: remoteRequested ? 1 : 0,
    };
  });
}

export default router;
