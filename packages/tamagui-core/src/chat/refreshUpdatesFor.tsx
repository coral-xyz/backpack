import type { MessageUpdates, SubscriptionType } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import {
  bulkAddChats,
  latestReceivedUpdate,
  processMessageUpdates,
} from "@coral-xyz/db";

import { getAuthHeader } from "./getAuthHeader";
import { SignalingManager } from "./SignalingManager";

export const refreshUpdatesFor = async (
  uuid: string,
  room: string,
  type: SubscriptionType,
  nftMint?: string,
  publicKey?: string, // To avoid DB calls on the backend
  jwt?: string
) => {
  const lastUpdate = await latestReceivedUpdate(uuid, room.toString(), type);

  const response = await fetch(
    `${BACKEND_API_URL}/chat/updates?room=${room}&type=${type}&lastSeenUpdate=${
      lastUpdate?.last_received_update_id || 0
    }&mint=${nftMint}&publicKey=${publicKey}&updatesSinceTimestamp=${
      lastUpdate?.last_local_reset_time || 0
    }`,
    {
      method: "GET",
      headers: {
        ...getAuthHeader(jwt),
      },
    }
  );

  const json = await response.json();
  const updates: MessageUpdates[] = json?.updates || [];

  const processedUpdates = await processMessageUpdates(uuid, updates);

  SignalingManager.getInstance().onUpdateRecoil({
    type: "chat",
    payload: {
      uuid,
      room,
      type,
      chats: processedUpdates.map((chat) => ({
        ...chat,
        direction: uuid === chat.uuid ? "send" : "recv",
      })),
    },
  });

  await bulkAddChats(
    uuid,
    processedUpdates.map((chat) => ({
      ...chat,
      direction: uuid === chat.uuid ? "send" : "recv",
    }))
  );
};
