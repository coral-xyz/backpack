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

export const postChat = (
  room: string,
  message: string,
  uuid: string,
  message_kind: MessageKind,
  client_generated_uuid: string,
  type: SubscriptionType,
  messageMetadata?: MessageMetadata,
  parent_client_generated_uuid?: string
) => {
  const secureTransferMutation =
    message_kind === "secure-transfer"
      ? {
          secure_transfer_transactions: {
            data: [
              {
                counter: messageMetadata?.counter || "",
                escrow: messageMetadata?.escrow || "",
                signature: messageMetadata?.signature || "",
                from: "",
                to: "",
                current_state: "pending",
                message_id: 0,
              },
            ],
          },
        }
      : {};
  chain("mutation")({
    insert_chats_one: [
      {
        object: {
          ...secureTransferMutation,
          username: "",
          room,
          message: message,
          uuid,
          message_kind,
          client_generated_uuid,
          parent_client_generated_uuid,
          type: type,
          created_at: new Date(),
        },
      },
      {
        id: true,
      },
    ],
  })
    .then((x) => console.log(x))
    .catch((e) => console.log(`Error while adding chat msg to DB ${e}`));
};
