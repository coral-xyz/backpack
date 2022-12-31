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
  timestampBefore,
  timestampAfter,
  limit = 10,
}: {
  room: string;
  type: SubscriptionType;
  lastChatId: number;
  limit: number;
  timestampBefore: Date;
  timestampAfter: Date;
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
          created_at: {
            _lte: timestampBefore,
            _gte: timestampAfter,
          },
        },
      },
      {
        id: true,
        uuid: true,
        type: true,
        room: true,
        message: true,
        client_generated_uuid: true,
        message_kind: true,
        created_at: true,
        parent_client_generated_uuid: true,
      },
    ],
  });

  const chats: Message[] = [];

  if (!response.chats) {
    return [];
  }

  response.chats.map((chat) => {
    if (!chat) {
      return;
    }
    chats.push({
      uuid: chat.uuid,
      message: chat.message,
      client_generated_uuid: chat.client_generated_uuid,
      message_kind: chat.message_kind,
      created_at: chat.created_at,
      parent_client_generated_uuid: chat.parent_client_generated_uuid,
      room: chat.room,
      type: chat.type,
    });
  });
  return chats;
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
