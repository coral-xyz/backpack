import type {
  Message,
  MessageWithMetadata,
  SubscriptionType,
} from "@coral-xyz/common";

import { getChatsFromParentGuids } from "./chats";

export const enrichMessages = async (
  messages: Message[],
  room: string,
  type: SubscriptionType,
  newMessage = false
): Promise<MessageWithMetadata[]> => {
  const replyIds: string[] = messages.map(
    (m) => m.parent_client_generated_uuid || ""
  );

  const uniqueReplyIds = replyIds
    .filter((x, index) => replyIds.indexOf(x) === index)
    .filter((x) => x);

  const replyToMessageMappings: Map<
    string,
    {
      parent_message_text: string;
      parent_message_author_uuid: string;
    }
  > = new Map<
    string,
    {
      parent_message_text: string;
      parent_message_author_uuid: string;
    }
  >();

  if (uniqueReplyIds.length) {
    const parentReplies = await getChatsFromParentGuids(
      room.toString(),
      type,
      uniqueReplyIds
    );
    uniqueReplyIds.forEach((replyId) => {
      const reply = parentReplies.find(
        (x) => x.client_generated_uuid === replyId
      );
      if (reply) {
        replyToMessageMappings.set(replyId, {
          parent_message_text: reply.deleted
            ? "This message has been removed"
            : reply.message,
          parent_message_author_uuid: reply.uuid || "",
        });
      } else {
        console.log(`reply with id ${replyId} not found`);
      }
    });
  }

  return messages.map((message) => {
    return {
      ...message,
      parent_message_text: message.parent_client_generated_uuid
        ? replyToMessageMappings.get(message.parent_client_generated_uuid || "")
            ?.parent_message_text
        : undefined,
      parent_message_author_uuid: message.parent_client_generated_uuid
        ? replyToMessageMappings.get(message.parent_client_generated_uuid || "")
            ?.parent_message_author_uuid
        : undefined,
      created_at: newMessage
        ? new Date().getTime().toString()
        : new Date(message.created_at).getTime().toString(),
    };
  });
};
