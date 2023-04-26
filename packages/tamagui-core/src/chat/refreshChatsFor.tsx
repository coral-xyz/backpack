import type { MessageWithMetadata, SubscriptionType } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import {
  bulkAddChats,
  clearChats,
  latestReceivedMessage,
  resetUpdateTimestamp,
} from "@coral-xyz/db";

import { getAuthHeader } from "./getAuthHeader";
import { SignalingManager } from "./SignalingManager";

export const refreshChatsFor = async (
  uuid: string,
  room: string,
  type: SubscriptionType,
  nftMint?: string,
  publicKey?: string, // To avoid DB calls on the backend
  jwt?: string
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
      headers: {
        ...getAuthHeader(jwt),
      },
    }
  );

  const json = await response.json();
  const chats: MessageWithMetadata[] = json?.chats || [];

  if (chats.length >= 40) {
    // we received a fresh set of messages and we reset the message state locally
    await resetUpdateTimestamp(uuid, room);
  }

  if (chats.length >= 40) {
    SignalingManager.getInstance().onUpdateRecoil({
      type: "chat",
      payload: {
        uuid,
        type,
        room,
        clear: true,
        chats: chats.map((chat) => ({
          ...chat,
          direction: uuid === chat.uuid ? "send" : "recv",
          received: true,
          from_http_server: 1,
        })),
      },
    });
  } else {
    SignalingManager.getInstance().onUpdateRecoil({
      type: "chat",
      payload: {
        uuid,
        type,
        room,
        chats: chats.map((chat) => ({
          ...chat,
          direction: uuid === chat.uuid ? "send" : "recv",
          received: true,
          from_http_server: 1,
        })),
      },
    });
  }
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
