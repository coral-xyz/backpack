import type {
  EnrichedMessage,
  MessageWithMetadata,
  SubscriptionType} from "@coral-xyz/common";
import {
  BACKEND_API_URL
} from "@coral-xyz/common";

import { bulkAddChats, clearChats, latestReceivedMessage } from "../db/chats";

export const refreshChatsFor = async (
  uuid: string,
  room: string,
  type: SubscriptionType
): Promise<EnrichedMessage[]> => {
  const lastMessage = await latestReceivedMessage(uuid, room, type);
  const response = await fetch(`${BACKEND_API_URL}/chats/after`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room: room,
      type,
      lastMessageId: lastMessage.id,
      limit: 40,
    }),
  });
  const json = await response.json();
  const chats: MessageWithMetadata[] = json.chats;

  if (chats.length >= 40) {
    clearChats(uuid, room, type);
  }

  await bulkAddChats(
    uuid,
    chats.map((chat) => ({
      ...chat,
      direction: uuid === chat.uuid ? "send" : "recv",
      received: true,
    }))
  );
};
