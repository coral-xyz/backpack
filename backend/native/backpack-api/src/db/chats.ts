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
        limit: 10,
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
      },
    ],
  });

  return (
    response.chats.sort((a, b) => (a.created_at < b.created_at ? -1 : 1)) || []
  );
};
