import { insertNotification } from "@coral-xyz/backend-common";
import type { SubscriptionType } from "@coral-xyz/common";
import {
  AVATAR_BASE_URL,
  DEFAULT_GROUP_CHATS,
  parseMessage,
  WHITELISTED_CHAT_COLLECTIONS,
} from "@coral-xyz/common";

import { getMessages } from "./db/chats";
import { getLatestReadMessage } from "./db/collection_messages";
import { getFriendship } from "./db/friendships";
import { getAllUsersInCollection } from "./db/nft";
import { getUsersFromIds } from "./db/users";
import { notify } from "./notifier";
import { Redis } from "./Redis";

export const processMessage = async ({
  type,
  room,
  client_generated_uuid,
}: {
  type: SubscriptionType;
  room: number | string;
  client_generated_uuid: string;
}) => {
  if (type === "individual") {
    const friendship = await getFriendship({ room });
    if (!friendship) {
      console.log(`Room with id ${room} not found`);
      return;
    }
    const user1_last_read_message_id =
      friendship.user1_last_read_message_id || "";
    const user2_last_read_message_id =
      friendship.user2_last_read_message_id || "";
    const messages = await getMessages({
      client_generated_uuid,
      user1_last_read_message_id,
      user2_last_read_message_id: user2_last_read_message_id,
    });
    const messageSender = messages[client_generated_uuid].uuid;

    const messageParts = parseMessage(messages[client_generated_uuid]?.message);
    const taggedUsers = messageParts
      .filter((x) => x.type === "tag")
      .map((x) => x.value);
    const userMetadata = await getUsersFromIds([...taggedUsers, messageSender]);
    const parsedMessage = messageParts
      .map(({ type, value }) => {
        if (type === "tag") {
          return userMetadata.find((x) => x.id === value)?.username;
        } else {
          return value;
        }
      })
      .join(" ");

    const messageSenderUsername = userMetadata.find(
      (x) => x.id === messageSender
    )?.username;

    const messageSenderImage = `${AVATAR_BASE_URL}/${messageSenderUsername}`;

    if (messageSender === friendship.user1) {
      if (
        friendship.last_message_sender !== friendship.user2 &&
        (!messages[user2_last_read_message_id]?.created_at ||
          new Date(messages[user2_last_read_message_id]?.created_at) <
            new Date(messages[client_generated_uuid].created_at))
      ) {
        await notify(
          friendship.user2,
          `New Message from ${messageSenderUsername}`,
          parsedMessage,
          getUserHref(messageSender, messageSenderUsername),
          messageSenderImage
        );
      }
    } else {
      if (
        friendship.last_message_sender !== friendship.user1 &&
        (!messages[user1_last_read_message_id]?.created_at ||
          new Date(messages[user1_last_read_message_id]?.created_at) <
            new Date(messages[client_generated_uuid].created_at))
      ) {
        await notify(
          friendship.user1,
          `New Message from ${messageSenderUsername}`,
          parsedMessage,
          getUserHref(messageSender, messageSenderUsername),
          messageSenderImage
        );
      }
    }
  } else {
    if (DEFAULT_GROUP_CHATS.map((x) => x.id).includes(room as string)) {
      const messages = await getMessages({
        client_generated_uuid,
        user1_last_read_message_id: "",
        user2_last_read_message_id: "",
      });
      const messageParts = parseMessage(
        messages[client_generated_uuid]?.message
      );
      const taggedUsers = messageParts
        .filter((x) => x.type === "tag")
        .map((x) => x.value);
      const userMetadata = await getUsersFromIds([
        ...taggedUsers,
        messages[client_generated_uuid]?.uuid,
      ]);
      const parsedMessage = messageParts
        .map(({ type, value }) => {
          if (type === "tag") {
            return userMetadata.find((x) => x.id === value)?.username;
          } else {
            return value;
          }
        })
        .join(" ");
      await Promise.all(
        messageParts
          .filter((x) => x.type === "tag")
          .map(({ value: remoteUserId }) => {
            return notify(
              remoteUserId,
              `New message from ${
                userMetadata.find(
                  (x) => x.id === messages[client_generated_uuid]?.uuid
                )?.username
              }`,
              parsedMessage
            );
          })
      );
      return;
    }
    // Not sending group messages for now
    return;
    const uuids = await getAllUsersInCollection(room as string);
    uuids.map(async (uuid) => {
      await Redis.getInstance().send(
        JSON.stringify({
          type: "fanned-out-group-message",
          payload: {
            uuid,
            room: room,
            client_generated_uuid: client_generated_uuid,
          },
        })
      );
    });
  }
};

export const processFannedOutMessage = async ({
  uuid,
  room,
  client_generated_uuid,
}: {
  uuid: string;
  room: string;
  client_generated_uuid: string;
}) => {
  const lastReadMessage = await getLatestReadMessage(uuid, room);

  const messages = await getMessages({
    client_generated_uuid,
    lastReadMessage: lastReadMessage ? lastReadMessage : "",
  });

  const messageSender = messages[client_generated_uuid]?.uuid;
  const messageParts = parseMessage(messages[client_generated_uuid]?.message);
  const taggedUsers = messageParts
    .filter((x) => x.type === "tag")
    .map((x) => x.value);
  const userMetadata = await getUsersFromIds([...taggedUsers, messageSender]);
  const parsedMessage = messageParts
    .map(({ type, value }) => {
      if (type === "tag") {
        return userMetadata.find((x) => x.id === value)?.username;
      } else {
        return value;
      }
    })
    .join(" ");

  if (
    !lastReadMessage ||
    new Date(messages[lastReadMessage].created_at) <
      new Date(messages[client_generated_uuid].created_at)
  ) {
    await notify(
      uuid,
      `New Message from ${
        userMetadata.find((x) => x.id === messageSender)?.username
      }`,
      parsedMessage,
      getGroupHref(
        messages[client_generated_uuid]?.room,
        [...DEFAULT_GROUP_CHATS, ...WHITELISTED_CHAT_COLLECTIONS].find(
          (x) => x.id === messages[client_generated_uuid]?.room
        )?.name
      ),
      [...DEFAULT_GROUP_CHATS, ...WHITELISTED_CHAT_COLLECTIONS].find(
        (x) => x.id === messages[client_generated_uuid]?.room
      )?.image
    );
  }
};

export const processFriendRequest = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  const userMetadata = await getUsersFromIds([from]);

  await notify(
    to,
    `Friend Request`,
    `New Friend request from ${
      userMetadata.find((x) => x.id === from)?.username
    }`,
    `/popup.html#/notifications?title="Notifications"&props=%7B%7D&nav=tab`,
    `${AVATAR_BASE_URL}/${userMetadata.find((x) => x.id === from)?.username}`
  );
};

export const processFriendRequestAccept = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  const userMetadata = await getUsersFromIds([from]);
  await notify(
    to,
    `Friend request accepted`,
    `${
      userMetadata.find((x) => x.id === from)?.username
    } accepted your friend request`,
    `/popup.html#/notifications?title="Notifications"&props=%7B%7D&nav=tab`,
    `${AVATAR_BASE_URL}/${userMetadata.find((x) => x.id === from)?.username}`
  );
};

const getUserHref = (remoteUserId?: string, username?: string) => {
  if (!remoteUserId || !username) {
    return undefined;
  }
  return `/popup.html#/messages/chat?props=%7B"userId"%3A"${remoteUserId}"%2C"username"%3A"${username}"%2C"id"%3A"${remoteUserId}"%2C"fromInbox"%3Atrue%7D&title="%40${username}"`;
};

const getGroupHref = (id: string, name?: string) => {
  if (!name || !id) {
    return undefined;
  }
  return `/popup.html#/messages/groupchat?props=%7B%22id%22%3A%22${id}%22%2C%22fromInbox%22%3Atrue%7D&title=%22${name}%22&nav=push`;
};
