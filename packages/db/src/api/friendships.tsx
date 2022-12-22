import type { EnrichedInboxDb } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { ParentCommunicationManager } from "@coral-xyz/message-sdk";

import { getDb } from "../db";

export const refreshFriendships = async (uuid: string) => {
  const db = getDb(uuid);
  const res = await ParentCommunicationManager.getInstance().fetch(
    `${BACKEND_API_URL}/inbox?areConnected=true`
  );
  const json = await res.json();
  const chats: EnrichedInboxDb[] = json.chats;
  chats.forEach((chat) => {
    db.inbox.put(chat);
  });
};
