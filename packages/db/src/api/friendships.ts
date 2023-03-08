import type { CollectionChatData, EnrichedInboxDb } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";

import { getDb } from "../db";
import { createOrUpdateCollection } from "../db/chats";
import {
  createDefaultFriendship,
  getFriendshipByUserId,
  updateFriendship,
} from "../db/friends";

export const refreshFriendships = async (uuid: string) => {
  const db = getDb(uuid);
  try {
    const res = await fetch(`${BACKEND_API_URL}/inbox/all?uuid=${uuid}`);
    const json = await res.json();
    const chats: EnrichedInboxDb[] = json.chats;
    if (!chats) {
      return;
    }
    const existingChats = await db.inbox.toArray();
    existingChats.forEach((existingChat) => {
      if (!chats.find((x) => x.remoteUserId === existingChat.remoteUserId)) {
        db.inbox.delete(existingChat.remoteUserId);
      }
    });
    if (chats) {
      chats?.forEach((chat) => {
        db.inbox.put(chat);
      });
    }
  } catch (e) {
    console.error(e);
  }
};

export const refreshGroups = async (uuid: string) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/nft/bulk?uuid=${uuid}`, {
      method: "GET",
    });

    const res = await response.json();
    const collections: CollectionChatData[] = res.collections;
    collections?.forEach((collection) => {
      createOrUpdateCollection(uuid, collection);
    });
  } catch (e) {
    console.error(e);
  }
};

export const blockUser = async (uuid: string, to: string, blocked: boolean) => {
  await fetch(`${BACKEND_API_URL}/friends/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, block: blocked }),
  });
  await updateFriendship(uuid, to, { blocked: blocked ? 1 : 0 });
};

export const markSpam = async (uuid: string, to: string, spam: boolean) => {
  await fetch(`${BACKEND_API_URL}/friends/spam`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, spam }),
  });
  await updateFriendship(uuid, to, { spam: spam ? 1 : 0 });
};

export const createEmptyFriendship = async (
  uuid: string,
  remoteUserId: string,
  props: {
    last_message_sender?: string;
    last_message_timestamp?: string;
    last_message?: string;
    last_message_client_uuid?: string;
    remoteUsername?: string;
    id?: string;
  }
) => {
  const existingFriendship = await getFriendshipByUserId(uuid, remoteUserId);
  if (existingFriendship) {
    return;
  }
  await createDefaultFriendship(uuid, remoteUserId, props, {
    interacted: 1,
  });
};
