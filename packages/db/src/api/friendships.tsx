import type { EnrichedInboxDb } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { ParentCommunicationManager } from "@coral-xyz/message-sdk";

import { getDb } from "../db";
import { updateFriendship } from "../db/friends";

export const refreshFriendships = async (uuid: string) => {
  const db = getDb(uuid);
  const res = await ParentCommunicationManager.getInstance().fetch(
    `${BACKEND_API_URL}/inbox/all`
  );
  const json = await res.json();
  const chats: EnrichedInboxDb[] = json.chats;
  chats.forEach((chat) => {
    db.inbox.put(chat);
  });
};

export const blockUser = async (uuid: string, to: string, blocked: boolean) => {
  await fetch(`${BACKEND_API_URL}/friends/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, block: blocked }),
  });
  await updateFriendship(uuid, to, { blocked });
};

export const markSpam = async (uuid: string, to: string, spam: boolean) => {
  await fetch(`${BACKEND_API_URL}/friends/spam`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, spam }),
  });
  await updateFriendship(uuid, to, { spam });
};
