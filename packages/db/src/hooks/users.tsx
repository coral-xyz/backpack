import type { UserMetadata } from "@coral-xyz/common";
import { useLiveQuery } from "dexie-react-hooks";

import { refreshUsers } from "../api/users";
import { getDb } from "../db";

export const useUsers = (uuid: string, chats: any[]) => {
  const reqs = useLiveQuery(async () => {
    const userUuids =
      chats?.map((chat) => chat.remoteUserId || chat.uuid) || [];
    chats?.forEach((chat) => {
      if (chat.parent_message_author_uuid) {
        userUuids.push(chat.parent_message_author_uuid);
      }
    });
    const uniqueUserUuids = userUuids.filter(
      (x, index) => userUuids.indexOf(x) === index
    );
    return getDb(uuid).users.bulkGet(uniqueUserUuids);
  }, [chats]);

  return reqs || [];
};

export const useDbUser = (
  uuid: string,
  remoteUserId: string
): UserMetadata | undefined => {
  const reqs = useLiveQuery(async () => {
    if (!remoteUserId) {
      return {};
    }
    refreshUsers(uuid, [remoteUserId]);
    return getDb(uuid).users.get(remoteUserId);
  }, [uuid, remoteUserId]);

  return reqs as UserMetadata | undefined;
};
