import express from "express";
import { getChats } from "../../db/chats";
import { Message, MessageWithMetadata } from "@coral-xyz/common";
import { getUsers } from "../../db/users";
import { ensureHasRoomAccess, extractUserId } from "../../auth/middleware";

const router = express.Router();

router.get("/", extractUserId, ensureHasRoomAccess, async (req, res) => {
  const room = req.query.room;
  const type = req.query.type;
  const lastChatId = req.query.lastChatId || 10000000000;
  // @ts-ignore
  const chats = await getChats({ room, type, lastChatId });
  const enrichedChats = await enrichMessages(chats);
  res.json({ chats: enrichedChats });
});

async function enrichMessages(
  messages: Message[]
): Promise<MessageWithMetadata[]> {
  const userIds: string[] = messages.map((m) => m.uuid || "");
  const uniqueUserIds = userIds.filter(
    (x, index) => userIds.indexOf(x) === index
  );
  const metadatas = await getUsers(uniqueUserIds);
  return messages.map((message) => {
    const username =
      metadatas.find((x) => x.id === message.uuid || "")?.username || "";
    const image = `https://avatars.xnfts.dev/v1/${username}`;
    return {
      ...message,
      username,
      image,
    };
  });
}

export default router;
