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
  clientGeneratedUuid,
}: {
  room: string;
  type: SubscriptionType;
  lastChatId: number;
  limit: number;
  timestampBefore: Date;
  timestampAfter: Date;
  clientGeneratedUuid?: string;
}): Promise<Message[]> => {
  const clientUuidConstraint = clientGeneratedUuid
    ? {
        client_generated_uuid: { _eq: clientGeneratedUuid },
      }
    : {};
  const response = await chain("query")({
    chats: [
      {
        limit,
        //@ts-ignore
        order_by: [{ created_at: "desc" }],
        where: {
          ...clientUuidConstraint,
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
        deleted: true,
        room: true,
        message: true,
        client_generated_uuid: true,
        message_kind: true,
        created_at: true,
        parent_client_generated_uuid: true,
        secure_transfer_transactions: [
          {
            limit: 1,
          },
          {
            escrow: true,
            counter: true,
            signature: true,
            final_txn_signature: true,
            current_state: true,
          },
        ],
        chat_media_messages: [
          {
            limit: 1,
          },
          {
            media_kind: true,
            media_link: true,
          },
        ],
        chat_barter_metadata: [
          {
            limit: 1,
          },
          {
            barter: {
              id: true,
              state: true,
              on_chain_state: true,
            },
          },
        ],
        simple_transactions: [
          {
            limit: 1,
          },
          {
            txn_signature: true,
          },
        ],
        barter_poke_metadata: [
          {
            limit: 1,
          },
          {
            barter_id: true,
          },
        ],
        nft_sticker_metadata: [
          {
            limit: 1,
          },
          {
            mint: true,
          },
        ],
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
      message: chat.deleted ? "" : chat.message,
      client_generated_uuid: chat.client_generated_uuid,
      message_kind: chat.message_kind,
      created_at: chat.created_at,
      parent_client_generated_uuid: chat.parent_client_generated_uuid,
      room: chat.room,
      type: chat.type,
      deleted: chat.deleted,
      message_metadata: chat.deleted
        ? {}
        : chat.message_kind === "secure-transfer"
        ? {
            escrow: chat.secure_transfer_transactions[0]?.escrow,
            counter: chat.secure_transfer_transactions[0]?.counter,
            signature: chat.secure_transfer_transactions[0]?.signature,
            final_txn_signature:
              chat.secure_transfer_transactions[0]?.final_txn_signature,
            current_state: chat.secure_transfer_transactions[0]?.current_state,
          }
        : chat.message_kind === "media"
        ? {
            media_kind: chat.chat_media_messages[0]?.media_kind,
            media_link: chat.chat_media_messages[0]?.media_link,
          }
        : chat.message_kind === "transaction"
        ? {
            final_tx_signature: chat.simple_transactions[0]?.txn_signature,
          }
        : chat.message_kind === "barter"
        ? {
            barter_id: chat.chat_barter_metadata?.[0]?.barter?.id,
            state: chat.chat_barter_metadata?.[0]?.barter?.state,
            on_chain_state:
              chat.chat_barter_metadata?.[0]?.barter?.on_chain_state,
          }
        : chat.message_kind === "nft-sticker"
        ? {
            mint: chat.nft_sticker_metadata?.[0]?.mint,
          }
        : chat.message_kind === "barter-request"
        ? {
            barter_id: chat.barter_poke_metadata?.[0]?.barter_id,
          }
        : undefined,
    });
  });
  return chats;
};

export const updateSecureTransfer = async (
  messageId: number,
  room: string,
  state: "redeemed" | "cancelled",
  txn: string
) => {
  await chain("mutation")({
    update_secure_transfer_transactions: [
      {
        where: {
          message_client_generated_uuid: { _eq: messageId },
          chat: {
            room: {
              _eq: room,
            },
          },
        },
        _set: {
          current_state: state,
          final_txn_signature: txn,
        },
      },
      {
        affected_rows: true,
      },
    ],
  });
};
