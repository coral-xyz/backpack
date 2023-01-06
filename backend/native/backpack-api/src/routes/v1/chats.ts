import type {
  Message,
  MessageWithMetadata,
  SubscriptionType,
} from "@coral-xyz/common";
import express from "express";

import { ensureHasRoomAccess, extractUserId } from "../../auth/middleware";
import { getChats, getChatsFromParentGuids } from "../../db/chats";
import {
  updateLastReadGroup,
  updateLastReadIndividual,
} from "../../db/friendships";

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
    //@ts-ignore
    const type: SubscriptionType = req.query.type;
    // @ts-ignore
    const room: string = req.query.room;

    if (type === "individual") {
      await updateLastReadIndividual(
        user1,
        user2,
        client_generated_uuid,
        user1 === uuid ? "1" : "2"
      );
    } else {
      await updateLastReadGroup(uuid, room, client_generated_uuid);
    }
    res.json({});
  }
);

router.get("/", extractUserId, ensureHasRoomAccess, async (req, res) => {
  // @ts-ignore
  const room: string = req.query.room;
  // @ts-ignore
  const type: SubscriptionType = req.query.type;
  const timestampBefore = req.query.timestampBefore
    ? // @ts-ignore
      new Date(parseInt(req.query.timestampBefore))
    : new Date();
  const timestampAfter = req.query.timestampAfter
    ? // @ts-ignore
      new Date(parseInt(req.query.timestampAfter))
    : new Date(0);
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

  // @ts-ignore
  const chats = await getChats({
    room,
    type,
    timestampBefore,
    timestampAfter,
    limit,
  });
  const enrichedChats = await enrichMessages(chats, room, type);
  res.json({ chats: enrichedChats });
});

export const enrichMessages = async (
  messages: Message[],
  room: string,
  type: SubscriptionType
): Promise<MessageWithMetadata[]> => {
  const replyIds: string[] = messages.map(
    (m) => m.parent_client_generated_uuid || ""
  );

  const uniqueReplyIds = replyIds
    .filter((x, index) => replyIds.indexOf(x) === index)
    .filter((x) => x);

  const replyToMessageMappings: Map<
    string,
    {
      parent_message_text: string;
      parent_message_author_uuid: string;
    }
  > = new Map<
    string,
    {
      parent_message_text: string;
      parent_message_author_uuid: string;
    }
  >();

  if (uniqueReplyIds.length) {
    const parentReplies = await getChatsFromParentGuids(
      room.toString(),
      type,
      uniqueReplyIds
    );
    uniqueReplyIds.forEach((replyId) => {
      const reply = parentReplies.find(
        (x) => x.client_generated_uuid === replyId
      );
      if (reply) {
        replyToMessageMappings.set(replyId, {
          parent_message_text: reply.message,
          parent_message_author_uuid: reply.uuid || "",
        });
      } else {
        console.log(`reply with id ${replyId} not found`);
      }
    });
  }

  return messages.map((message) => {
    return {
      ...message,
      parent_message_text: message.parent_client_generated_uuid
        ? replyToMessageMappings.get(message.parent_client_generated_uuid || "")
            ?.parent_message_text
        : undefined,
      parent_message_author_uuid: message.parent_client_generated_uuid
        ? replyToMessageMappings.get(message.parent_client_generated_uuid || "")
            ?.parent_message_author_uuid
        : undefined,
      created_at: new Date(message.created_at).getTime().toString(),
    };
  });
};

export default router;
