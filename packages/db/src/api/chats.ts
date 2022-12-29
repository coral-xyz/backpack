import type { MessageWithMetadata, SubscriptionType } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";

import {
  bulkAddChats,
  clearChats,
  latestReceivedMessage,
  oldestReceivedMessage,
} from "../db/chats";
import { updateFriendship } from "../db/friends";

export const refreshChatsFor = async (
  uuid: string,
  room: string,
  type: SubscriptionType
) => {
  const lastMessage = await latestReceivedMessage(uuid, room, type);
  const response = await fetch(
    `${BACKEND_API_URL}/chat?room=${room}&type=${type}&limit=40&timestampAfter=${
      lastMessage?.created_at ? new Date(lastMessage?.created_at).getTime() : 0
    }`,
    {
      method: "GET",
    }
  );

  const json = await response.json();
  const chats: MessageWithMetadata[] = json?.chats || [];

  if (chats.length >= 40) {
    await clearChats(uuid, room, type);
  }

  await bulkAddChats(
    uuid,
    chats.map((chat) => ({
      ...chat,
      direction: uuid === chat.uuid ? "send" : "recv",
      received: true,
      from_http_server: 1,
    }))
  );
};

export const fetchMoreChatsFor = async (
  uuid: string,
  room: string,
  type: SubscriptionType
) => {
  const oldestMessage = await oldestReceivedMessage(uuid, room, type);
  console.error(room);
  console.error(type);
  console.error("oldestMessage");
  console.log(oldestMessage);
  const response = await fetch(
    `${BACKEND_API_URL}/chat?room=${room}&type=${type}&limit=40&timestampBefore=${
      oldestMessage?.created_at || new Date().getTime()
    }`,
    {
      method: "GET",
    }
  );

  const json = await response.json();
  const chats: MessageWithMetadata[] = json.chats;

  await bulkAddChats(
    uuid,
    chats.map((chat) => ({
      ...chat,
      direction: uuid === chat.uuid ? "send" : "recv",
      received: true,
      from_http_server: 1,
    }))
  );
};

export const updateLastRead = (
  uuid: string,
  client_generated_uuid: string,
  room: string,
  type: SubscriptionType,
  sender: string
) => {
  fetch(`${BACKEND_API_URL}/chat/lastRead?room=${room}&type=${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ client_generated_uuid }),
  });
  if (type === "individual" && uuid !== sender) {
    updateFriendship(uuid, sender, {
      unread: 0,
    });
  }
};
