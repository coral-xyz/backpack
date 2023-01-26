import type { SubscriptionType } from "@coral-xyz/common";
import { DEFAULT_GROUP_CHATS, parseMessage } from "@coral-xyz/common";

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

    if (messageSender === friendship.user1) {
      if (
        friendship.last_message_sender !== friendship.user2 &&
        (!messages[user2_last_read_message_id]?.created_at ||
          new Date(messages[user2_last_read_message_id]?.created_at) <
            new Date(messages[client_generated_uuid].created_at))
      ) {
        await notify(
          friendship.user2,
          `New Message from ${
            userMetadata.find((x) => x.id === messageSender)?.username
          }`,
          parsedMessage
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
          `New Message from ${
            userMetadata.find((x) => x.id === messageSender)?.username
          }`,
          parsedMessage
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
      parsedMessage
    );
  }
};
