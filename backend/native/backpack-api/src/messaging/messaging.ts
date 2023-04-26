import {
  enrichMessages,
  postChat,
  updateLatestMessage,
  updateLatestMessageGroup,
  validateRoom,
} from "@coral-xyz/backend-common";
import type {
  MessageKind,
  MessageMetadata,
  SubscriptionType} from "@coral-xyz/common";
import {
  CHAT_MESSAGES
} from "@coral-xyz/common";

import { Redis } from "../Redis";

export const sendMessage = async ({
  roomId,
  msg,
  type,
  userId,
}: {
  userId: string;
  roomId: string;
  msg: {
    client_generated_uuid: string;
    message: string;
    message_kind: MessageKind;
    parent_client_generated_uuid?: string;
    message_metadata?: MessageMetadata;
  };
  type: SubscriptionType;
}) => {
  const roomValidation = await validateRoom(userId, parseInt(roomId));
  postChat(
    roomId.toString(),
    msg.message,
    userId,
    msg.message_kind,
    msg.client_generated_uuid,
    type,
    msg.message_metadata,
    msg.parent_client_generated_uuid
  );

  if (type === "individual") {
    updateLatestMessage(
      parseInt(roomId),
      msg.message_kind === "gif"
        ? "GIF"
        : msg.message_kind === "secure-transfer"
        ? "Secure Transfer"
        : msg.message_kind === "media"
        ? "Media"
        : msg.message,
      userId,
      roomValidation,
      msg.client_generated_uuid
    );
  } else {
    updateLatestMessageGroup(
      roomId,
      msg.message_kind === "gif"
        ? "GIF"
        : msg.message_kind === "secure-transfer"
        ? "Secure Transfer"
        : msg.message_kind === "media"
        ? "Media"
        : msg.message,
      msg.client_generated_uuid
    );
  }
  const emittedMessage = (
    await enrichMessages(
      [
        {
          uuid: userId,
          message: msg.message,
          client_generated_uuid: msg.client_generated_uuid,
          message_kind: msg.message_kind,
          parent_client_generated_uuid: msg.parent_client_generated_uuid,
          created_at: new Date().toString(),
          room: roomId,
          type,
          message_metadata: {
            ...msg.message_metadata,
            current_state:
              msg.message_kind === "secure-transfer" ? "pending" : undefined,
          },
        },
      ],
      roomId,
      type,
      true
    )
  )[0];

  if (type === "individual") {
    Redis.getInstance().publish(`INDIVIDUAL_${roomValidation?.user2}`, {
      type: CHAT_MESSAGES,
      payload: {
        messages: [emittedMessage],
      },
    });
    Redis.getInstance().publish(`INDIVIDUAL_${roomValidation?.user1}`, {
      type: CHAT_MESSAGES,
      payload: {
        messages: [emittedMessage],
      },
    });
  } else {
    Redis.getInstance().publish(`COLLECTION_${roomId}`, {
      type: CHAT_MESSAGES,
      payload: {
        messages: [emittedMessage],
      },
    });
  }

  setTimeout(async () => {
    await Redis.getInstance().send(
      JSON.stringify({
        type: "message",
        payload: {
          type: type,
          room: roomId,
          client_generated_uuid: msg.client_generated_uuid,
        },
      })
    );
  }, 1000);
};
