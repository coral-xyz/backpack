import type { SubscriptionType } from "@coral-xyz/common";

import { getMessages } from "./db/chats";
import { getFriendship } from "./db/friendships";
import { notify } from "./notifier";

export const processMessage = async ({
  type,
  room,
  client_generated_uuid,
}: {
  type: SubscriptionType;
  room: number;
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

    if (messageSender === friendship.user1) {
      if (
        friendship.last_message_sender !== friendship.user2 &&
        (!messages[user2_last_read_message_id]?.created_at ||
          new Date(messages[user2_last_read_message_id]?.created_at) <
            new Date(messages[client_generated_uuid].created_at))
      ) {
        await notify(
          friendship.user2,
          `New Message`,
          messages[client_generated_uuid].message
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
          `New Message`,
          messages[client_generated_uuid].message
        );
      }
    }
  } else {
    // TODO: fan out bulk notifications via redis
  }
};
