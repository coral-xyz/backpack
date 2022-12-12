import type {
  Message,
  MessageWithMetadata,
  SubscriptionType,
} from "@coral-xyz/common";
import express from "express";

import { ensureHasRoomAccess, extractUserId } from "../../auth/middleware";
import { getChats, getChatsFromParentGuids } from "../../db/chats";
import { updateLastReadIndividual } from "../../db/friendships";
import { getUsers } from "../../db/users";

const router = express.Router();

router.post(
  "/lastRead",
  extractUserId,
  ensureHasRoomAccess,
  async (req, res) => {
    // @ts-ignore
    const client_generated_uuid: string = req.body.client_generated_uuid;
    // @ts-ignore
    const { user1, user2 } = req.roomMetadata;
    //@ts-ignore
    const uuid: string = req.id;

    await updateLastReadIndividual(
      user1,
      user2,
      client_generated_uuid,
      user1 === uuid ? "1" : "2"
    );
    res.json({});
  }
);

router.get("/", extractUserId, ensureHasRoomAccess, async (req, res) => {
  const room = req.query.room;
  const type = req.query.type;
  const lastChatId = req.query.lastChatId || 10000000000;
  // @ts-ignore
  const chats = await getChats({ room, type, lastChatId });
  const enrichedChats = await enrichMessages(room, type, chats);
  res.json({ chats: enrichedChats });
});

const enrichMessages = async (
  room: string,
  type: SubscriptionType,
  messages: Message[]
): Promise<MessageWithMetadata[]> => {
  const replyIds: string[] = messages.map(
    (m) => m.parent_client_generated_uuid || ""
  );
  let replyToMessageMappings = new Map<
      string,
      {
        parent_message_text: string;
        parent_message_author_username: string;
        parent_message_author_uuid: string;
      }
    >(),
    userIdMappings = new Map<string, { username: string }>();

  const uniqueReplyIds = replyIds
    .filter((x, index) => replyIds.indexOf(x) === index)
    .filter((x) => x);

  if (uniqueReplyIds.length) {
    const parentReplies = await getChatsFromParentGuids(
      room.toString(),
      type,
      uniqueReplyIds
    );
    userIdMappings = await enrichUsernames([...messages, ...parentReplies]);
    uniqueReplyIds.forEach((replyId) => {
      const reply = parentReplies.find(
        (x) => x.client_generated_uuid === replyId
      );
      if (reply) {
        replyToMessageMappings.set(replyId, {
          parent_message_text: reply.message,
          parent_message_author_uuid: reply.uuid || "",
          parent_message_author_username:
            userIdMappings.get(reply.uuid || "")?.username || "",
        });
      } else {
        console.log(`reply with id ${replyId} not found`);
      }
    });
  } else {
    userIdMappings = await enrichUsernames(messages);
  }

  return messages.map((message) => {
    const username = userIdMappings.get(message.uuid || "")?.username || "";
    const image = `https://avatars.xnfts.dev/v1/${username}`;
    return {
      ...message,
      username,
      image,
      parent_message_text: message.parent_client_generated_uuid
        ? replyToMessageMappings.get(message.parent_client_generated_uuid || "")
            ?.parent_message_text
        : undefined,
      parent_message_author_username: message.parent_client_generated_uuid
        ? replyToMessageMappings.get(message.parent_client_generated_uuid || "")
            ?.parent_message_author_username
        : undefined,
      parent_message_author_uuid: message.parent_client_generated_uuid
        ? replyToMessageMappings.get(message.parent_client_generated_uuid || "")
            ?.parent_message_author_uuid
        : undefined,
    };
  });
};

const enrichUsernames = async (messages: Message[]) => {
  const userIds: string[] = messages.map((m) => m.uuid || "");
  const userIdMappings = new Map<string, { username: string }>();
  const uniqueUserIds = userIds
    .filter((x, index) => userIds.indexOf(x) === index)
    .filter((x) => !userIdMappings.get(x || ""));

  if (uniqueUserIds.length) {
    const metadatas = await getUsers(uniqueUserIds);
    metadatas.forEach(({ id, username }) =>
      userIdMappings.set(id, { username })
    );
  }
  return userIdMappings;
};

export default router;
