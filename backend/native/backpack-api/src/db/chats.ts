import { Chain } from "@coral-xyz/chat-zeus";
import { CHAT_JWT, CHAT_HASURA_URL } from "../config";
import { Message, SubscriptionType } from "@coral-xyz/common";

const chain = Chain(CHAT_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${CHAT_JWT}`,
  },
});

export const getChats = async ({
  room,
  type,
  lastChatId,
}: {
  room: string;
  type: SubscriptionType;
  lastChatId: number;
}): Promise<Message[]> => {
  const response = await chain("query")({
    chats: [
      {
        limit: 50,
        //@ts-ignore
        order_by: [{ id: "asc" }],
        where: {
          room: { _eq: this.room },
          //@ts-ignore
          type: { _eq: this.type },
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
        created_at: true,
      },
    ],
  });

  return response.chats || [];
};
