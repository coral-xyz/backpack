import { Chain } from "@coral-xyz/chat-zeus";
import type { MessageUpdates, SubscriptionType } from "@coral-xyz/common";
import { DELETE_MESSAGE } from "@coral-xyz/common";

import { CHAT_HASURA_URL, CHAT_JWT } from "../config";

const chain = Chain(CHAT_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${CHAT_JWT}`,
  },
});

export const deleteMessage = async (
  client_generated_uuid: string,
  type: SubscriptionType,
  room: string
) => {
  await chain("mutation")({
    insert_chat_update_history_one: [
      {
        object: {
          type: DELETE_MESSAGE,
          client_generated_uuid,
          room,
        },
      },
      {
        id: true,
      },
    ],
  })
    .then((x) => console.log(x))
    .catch((e) => {
      console.log(`Error while adding chat msg to DB`);
      console.log(e);
    });
};

export const getHistoryUpdates = async (
  room: string,
  lastSeenUpdate: number,
  updatesSinceTimestamp: number
): Promise<MessageUpdates[]> => {
  const response = await chain("query")({
    chat_update_history: [
      {
        where: {
          room: { _eq: room },
          id: { _gt: lastSeenUpdate },
          created_at: {
            _gte: updatesSinceTimestamp
              ? new Date(updatesSinceTimestamp).toUTCString()
              : new Date(1122292384789).toUTCString(),
          },
        },
      },
      {
        id: true,
        type: true,
        room: true,
        client_generated_uuid: true,
      },
    ],
  });
  return response.chat_update_history.map((x) => ({
    type: x.type,
    id: x.id,
    room: x.room,
    client_generated_uuid: x.client_generated_uuid,
  }));
};
