import { Chain } from "@coral-xyz/chat-zeus";

import { CHAT_HASURA_URL, CHAT_JWT } from "../config";

const chain = Chain(CHAT_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${CHAT_JWT}`,
  },
});

import type {
  MessageKind,
  MessageMetadata,
  SubscriptionType,
} from "@coral-xyz/common";

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
                //@ts-ignore
                counter: messageMetadata?.counter || "",
                //@ts-ignore
                escrow: messageMetadata?.escrow || "",
                //@ts-ignore
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

  const mediaMessageMutation =
    message_kind === "media"
      ? {
          chat_media_messages: {
            data: [
              {
                //@ts-ignore
                media_kind: messageMetadata?.media_kind || "",
                //@ts-ignore
                media_link: messageMetadata?.media_link || "",
              },
            ],
          },
        }
      : {};

  const simpleTransferMutation =
    message_kind === "transaction"
      ? {
          simple_transactions: {
            data: [
              {
                //@ts-ignore
                txn_signature: messageMetadata?.final_tx_signature || "",
              },
            ],
          },
        }
      : {};

  const barterMessageMutation =
    message_kind === "barter"
      ? {
          chat_barter_metadata: {
            data: [
              {
                //@ts-ignore
                barter_id: messageMetadata?.barter_id || "",
              },
            ],
          },
        }
      : {};

  const nftStickerMutation =
    message_kind === "nft-sticker"
      ? {
          nft_sticker: {
            data: [
              {
                //@ts-ignore
                mint: messageMetadata?.mint || "",
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
          ...mediaMessageMutation,
          ...simpleTransferMutation,
          ...barterMessageMutation,
          ...nftStickerMutation,
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
    .catch((e) => {
      console.log(`Error while adding chat msg to DB`);
      console.log(e);
    });
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
