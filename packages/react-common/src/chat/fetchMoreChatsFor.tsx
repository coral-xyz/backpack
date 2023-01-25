import type {
  MessageWithMetadata,
  SubscriptionType} from "@coral-xyz/common";
import {
  BACKEND_API_URL
} from "@coral-xyz/common";
import { bulkAddChats,oldestReceivedMessage  } from "@coral-xyz/db";

import { SignalingManager } from "./SignalingManager";

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

  SignalingManager.getInstance().onUpdateRecoil({
    type: "chat",
    payload: {
      uuid,
      room,
      type,
      chats: chats.map((chat) => ({
        ...chat,
        direction: uuid === chat.uuid ? "send" : "recv",
        received: true,
        from_http_server: 1,
      })),
    },
  });

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
