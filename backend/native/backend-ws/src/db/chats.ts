import { Chain } from "@coral-xyz/chat-zeus";
import type {
  MessageKind,
  MessageMetadata,
  SubscriptionType,
} from "@coral-xyz/common";

import { CHAT_HASURA_URL, CHAT_JWT } from "../config";

const chain = Chain(CHAT_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${CHAT_JWT}`,
  },
});

export const getChats = async (
  roomId: string,
  type: SubscriptionType,
  limit = 50,
  offset = 0
) => {
  const response = await chain("query")({
    chats: [
      {
        limit: limit,
        offset: offset,
        //@ts-ignore
        order_by: [{ created_at: "desc" }],
        where: {
          room: { _eq: roomId },
          //@ts-ignore
          type: { _eq: type },
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
