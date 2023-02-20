import { Chain } from "@coral-xyz/chat-zeus";

import { CHAT_HASURA_URL, CHAT_JWT } from "../config";

const chain = Chain(CHAT_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${CHAT_JWT}`,
  },
});

export const getMessages = async ({
  client_generated_uuid,
  user1_last_read_message_id,
  user2_last_read_message_id,
  lastReadMessage,
}: {
  client_generated_uuid: string;
  user1_last_read_message_id?: string;
  user2_last_read_message_id?: string;
  lastReadMessage?: string;
}): Promise<{
  [client_generated_uuid: string]: {
    id: string;
    uuid: string;
    created_at: string;
    message: string;
    room: string;
  };
}> => {
  const response = await chain("query")({
    chats: [
      {
        limit: 10,
        //@ts-ignore
        order_by: [{ created_at: "desc" }],
        where: {
          client_generated_uuid: {
            _in: [
              client_generated_uuid,
              user1_last_read_message_id || "",
              user2_last_read_message_id || "",
              lastReadMessage || "",
            ],
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
        room: true,
      },
    ],
  });

  const result: {
    [client_generated_uuid: string]: {
      id: string;
      uuid: string;
      created_at: string;
      message: string;
      room: string;
    };
  } = {};

  response.chats.forEach((chat) => {
    result[chat?.client_generated_uuid || ""] = {
      id: chat?.id || "",
      uuid: chat?.uuid || "",
      created_at: chat?.created_at || "",
      message: chat?.message || "",
      room: chat?.room || "",
    };
  });
  return result;
};
