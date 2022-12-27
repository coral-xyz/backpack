import { useEffect } from "react";
import type {
  EnrichedMessageWithMetadata,
  SubscriptionType} from "@coral-xyz/common";
import {
  EnrichedMessage
} from "@coral-xyz/common";
import { useLiveQuery } from "dexie-react-hooks";

import { refreshUsers } from "../api/users";
import { getDb } from "../db";

import { useUsers } from "./users";

export const useActiveChats = (uuid: string) => {
  const activeChats = useLiveQuery(async () => {
    return getDb(uuid).inbox.where({ blocked: 0, interacted: 1 }).toArray();
  });

  return activeChats;
};

export const useRequestsCount = (uuid: string) => {
  const count = useLiveQuery(async () => {
    return getDb(uuid).inbox.where({ are_friends: 0, interacted: 0 }).count();
  });

  return count;
};

export const useRequests = (uuid: string) => {
  const reqs = useLiveQuery(async () => {
    return getDb(uuid).inbox.where({ areFriends: 0, interacted: 0 }).toArray();
  });

  return reqs;
};

export const useRoomChats = (
  uuid: string,
  room: string,
  type: SubscriptionType
) => {
  const reqs = useLiveQuery(async () => {
    return getDb(uuid).messages.where({ room, type }).toArray();
  });
  return reqs;
};

export const useRoomChatsWithMetadata = (
  uuid: string,
  room: string,
  type: SubscriptionType
): EnrichedMessageWithMetadata[] => {
  const chats = useRoomChats(uuid, room, type) || [];
  const users = useUsers(uuid, chats?.map((chat) => chat.uuid) || []);

  useEffect(() => {
    const userIds = chats?.map((chat) => chat.uuid) || [];
    const uniqueUserIds = userIds
      .filter((x, index) => userIds.indexOf(x) === index)
      .filter((x) => x);
    refreshUsers(uuid, uniqueUserIds);
  }, [chats]);

  return chats.map((chat) => ({
    ...chat,
    image: users?.find((x) => x?.uuid)?.image || "",
    username: users?.find((x) => x?.uuid)?.username || "",
  }));
};
