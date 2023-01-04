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
  type: SubscriptionType,
  nftMint?: string,
  publicKey?: string // To avoid DB calls on the backend
) => {
  const lastMessage = await latestReceivedMessage(uuid, room, type);
  const response = await fetch(
    `${BACKEND_API_URL}/chat?room=${room}&type=${type}&limit=40&timestampAfter=${
      lastMessage?.created_at &&
      !isNaN(new Date(parseInt(lastMessage?.created_at)).getTime())
        ? new Date(parseInt(lastMessage?.created_at)).getTime()
        : 0
    }&mint=${nftMint}&publicKey=${publicKey}`,
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
  type: SubscriptionType,
  nftMint?: string,
  publicKey?: string // To avoid DB calls on the backend
) => {
  const oldestMessage = await oldestReceivedMessage(uuid, room, type);
  const response = await fetch(
    `${BACKEND_API_URL}/chat?room=${room}&type=${type}&limit=40&timestampBefore=${
      oldestMessage?.created_at && !isNaN(parseInt(oldestMessage?.created_at))
        ? oldestMessage?.created_at
        : new Date().getTime()
    }&mint=${nftMint}&publicKey=${publicKey}`,
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
  sender: string,
  publicKey?: string,
  nftMint?: string // To avoid DB calls on the backend
) => {
  fetch(
    `${BACKEND_API_URL}/chat/lastRead?room=${room}&type=${type}&publicKey=${publicKey}&mint=${nftMint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ client_generated_uuid }),
    }
  );
  if (type === "individual" && uuid !== sender) {
    updateFriendship(uuid, sender, {
      unread: 0,
      interacted: 1,
    });
  }
};
