import { useEffect } from "react";
import type { SubscriptionType } from "@coral-xyz/common";
import { useLiveQuery } from "dexie-react-hooks";

import { refreshUsers } from "../api/users";
import { getDb } from "../db";

import { useUsers } from "./users";

export const useUnreadGlobal = (uuid: string | null) => {
  const count = useLiveQuery(async () => {
    if (!uuid) return 0;
    return getDb(uuid)
      .inbox.where({ unread: 1, blocked: 0, interacted: 1 })
      .count();
  }, [uuid]);

  return (count || 0) > 0 ? true : false;
};

export const useRequests = (uuid: string) => {
  const activeChats = useLiveQuery(async () => {
    return getDb(uuid)
      .inbox.where({ areFriends: 0, interacted: 0, remoteInteracted: 1 })
      .toArray();
  });

  const users = useUsers(uuid, activeChats || []);

  useEffect(() => {
    const userIds = activeChats?.map((chat) => chat.remoteUserId) || [];
    const uniqueUserIds = userIds
      .filter((x, index) => userIds.indexOf(x) === index)
      .filter((x) => x);
    refreshUsers(uuid, uniqueUserIds);
  }, [activeChats]);

  return activeChats?.map((chat) => ({
    ...chat,
    remoteUserImage:
      users?.find((x) => x?.uuid === chat.remoteUserId)?.image || "",
    remoteUsername:
      users?.find((x) => x?.uuid === chat.remoteUserId)?.username || "",
  }));
};

export const useRoomChats = (
  uuid: string,
  room: string,
  type: SubscriptionType
) => {
  const reqs = useLiveQuery(async () => {
    return getDb(uuid).messages.where({ room, type }).sortBy("created_at");
  }, [room]);
  return reqs;
};
