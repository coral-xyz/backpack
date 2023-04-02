import type {
  EnrichedMessageWithMetadata,
  SubscriptionType,
  UserMetadata,
} from "@coral-xyz/common";
import { NEW_COLORS } from "@coral-xyz/common";
import { useChats, useUser } from "@coral-xyz/recoil";

import { useUsersMetadata } from "./useUsersMetadata";

export const useChatsWithMetadata = ({
  room,
  type,
}: {
  room: string;
  type: SubscriptionType;
}): {
  chats: EnrichedMessageWithMetadata[];
  usersMetadata: { [key: string]: UserMetadata };
} => {
  const { uuid } = useUser();
  const chats = useChats({ uuid, room, type });
  const userIds = chats?.map((chat) => chat.uuid) || [];
  chats?.forEach((chat) => {
    const taggedUserIds = getAllUserIdsInMessage(chat.message);
    if (chat.parent_message_author_uuid) {
      userIds.push(chat.parent_message_author_uuid);
    }
    taggedUserIds.forEach((x) => userIds.push(x));
  });
  const uniqueUserIds = userIds
    .filter((x, index) => userIds.indexOf(x) === index)
    .filter((x) => x);
  let users = useUsersMetadata({ remoteUserIds: uniqueUserIds });

  console.log("debug2", { chats, userIds, uniqueUserIds });
  
  // Make Sure that both the users in a DM chat do not have the same color
  if (uniqueUserIds.length === 2) {
    const userId1 = uniqueUserIds[0];
    const userId2 = uniqueUserIds[1];
    if (users[userId1] && users[userId2]) {
      if (users[userId1].colorIndex === users[userId2].colorIndex) {
        users[userId2].colorIndex =
          (users[userId1].colorIndex + 1) % NEW_COLORS.length;
      }
    }
  }
  
  return {
    chats: chats.map((chat) => ({
      ...chat,
      image: users[chat.uuid]?.image || "",
      username: users[chat.uuid]?.username || "",
      color: users[chat.uuid]?.color,
      colorIndex: users[chat.uuid]?.colorIndex,
      parent_message_author_username:
        users[chat.parent_message_author_uuid]?.username,
    })),
    usersMetadata: users,
  };
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
