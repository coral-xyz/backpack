import { useEffect } from "react";
import type {
  EnrichedMessageWithMetadata,
  SubscriptionType,
} from "@coral-xyz/common";
import { useLiveQuery } from "dexie-react-hooks";

import { refreshUsers } from "../api/users";
import { getDb } from "../db";

import { useUsers } from "./users";

export const useActiveChats = (uuid: string) => {
  const activeChats = useLiveQuery(async () => {
    return getDb(uuid)
      .inbox.where({ blocked: 0 })
      .filter(
        (x) =>
          x.interacted === 1 || (x.areFriends === 1 && x.remoteInteracted === 1)
      )
      .reverse()
      .sortBy("last_message_timestamp");
  }, [uuid]);
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

export const useRequestsCount = (uuid: string) => {
  const count = useLiveQuery(async () => {
    return getDb(uuid)
      .inbox.where({ areFriends: 0, interacted: 0, remoteInteracted: 1 })
      .count();
  });

  return count;
};

export const useUnreadGlobal = (uuid: string) => {
  const count = useLiveQuery(async () => {
    return getDb(uuid)
      .inbox.where({ unread: 1, blocked: 0, interacted: 1 })
      .count();
  });

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
    console.error("inside uselivequery");
    return getDb(uuid).messages.where({ room, type }).sortBy("created_at");
  }, [room]);
  return reqs;
};

export const useRoomChatsWithMetadata = (
  uuid: string,
  room: string,
  type: SubscriptionType
): EnrichedMessageWithMetadata[] | undefined => {
  const chats = useRoomChats(uuid, room, type);
  // const users = useUsers(uuid, chats || []);
  //
  // useEffect(() => {
  //   const userIds = chats?.map((chat) => chat.uuid) || [];
  //   chats?.forEach((chat) => {
  //     const taggedUserIds = getAllUserIdsInMessage(chat.message);
  //     taggedUserIds.forEach((x) => userIds.push(x));
  //   });
  //   const uniqueUserIds = userIds
  //     .filter((x, index) => userIds.indexOf(x) === index)
  //     .filter((x) => x);
  //   refreshUsers(uuid, uniqueUserIds);
  // }, [chats]);
  // @ts-ignore
  return chats?.map((chat) => ({
    ...chat,
    // image: users?.find((x) => x?.uuid === chat.uuid)?.image || "",
    // username: users?.find((x) => x?.uuid === chat.uuid)?.username || "",
    // color: users?.find((x) => x?.uuid === chat.uuid)?.color,
    // parent_message_author_username: users?.find(
    //   (x) => x?.uuid === chat.parent_message_author_uuid
    // )?.username,
  }));
};

export const getNftCollectionGroups = (uuid: string) => {
  const groups = useLiveQuery(async () => {
    return getDb(uuid).collections.toArray();
  });

  return groups;
};

function getAllUserIdsInMessage(message) {
  const userIds: string[] = [];
  for (let i = 0; i < message.length; i++) {
    if (message[i] === "<" && message[i + 1] === "@") {
      while (i < message.length && message[i] !== "|") {
        i++;
      }
      i++;
      i++;
      let userId = "";
      while (i < message.length && message[i] !== ">") {
        userId += message[i];
        i++;
      }
      if (i !== message.length) {
        userIds.push(userId);
      }
    }
  }
  return userIds;
}
