import type { MessageWithMetadata, SubscriptionType } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";

import { createOrUpdateCollection } from "../db/chats";
import { updateFriendship } from "../db/friends";

export const updateLastRead = (
  uuid: string,
  client_generated_uuid: string,
  room: string,
  type: SubscriptionType,
  sender: string,
  publicKey?: string,
  nftMint?: string // To avoid DB calls on the backend
) => {
  if (type === "individual" && uuid !== sender) {
    updateFriendship(uuid, sender, {
      unread: 0,
    });
  }

  if (type === "individual" && uuid === sender) {
    updateFriendship(uuid, sender, {
      interacted: 1,
    });
  }

  if (type === "collection") {
    createOrUpdateCollection(uuid, {
      collectionId: room,
      lastReadMessage: client_generated_uuid,
      lastMessageUuid: client_generated_uuid,
    });
  }

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
};
