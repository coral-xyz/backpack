import { Chain } from "@coral-xyz/chat-zeus";
import type { Message, SubscriptionType } from "@coral-xyz/common";

import { CHAT_HASURA_URL, CHAT_JWT } from "../config";

const chain = Chain(CHAT_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${CHAT_JWT}`,
  },
});

export const getChats = async ({
  room,
  type,
  lastChatId,
  limit = 10,
}: {
  room: string;
  type: SubscriptionType;
  lastChatId: number;
  limit: number;
}): Promise<Message[]> => {
  const response = await chain("query")({
    chats: [
      {
        limit,
        //@ts-ignore
        order_by: [{ created_at: "desc" }],
        where: {
          room: { _eq: room },
          //@ts-ignore
          type: { _eq: type },
          id: {
            _lt: lastChatId,
          },
        },
      },
      {
        id: true,
        uuid: true,
        message: true,
        client_generated_uuid: true,
        message_kind: true,
        created_at: true,
        parent_client_generated_uuid: true,
      },
    ],
  });

  return (
    response.chats.sort((a, b) => (a.created_at < b.created_at ? -1 : 1)) || []
  );
};

export const getChatsFromParentGuids = async (
  roomId: string,
  type: SubscriptionType,
  parentClientGeneratedGuids: string[]
) => {
  const response = await chain("query")({
    chats: [
      {
        where: {
          room: { _eq: roomId },
          //@ts-ignore
          type: { _eq: type },
          client_generated_uuid: { _in: parentClientGeneratedGuids },
        },
      },
      {
        id: true,
        uuid: true,
        message: true,
        client_generated_uuid: true,
        created_at: true,
        message_kind: true,
        parent_client_generated_uuid: true,
      },
    ],
  });
  return response.chats || [];
};
