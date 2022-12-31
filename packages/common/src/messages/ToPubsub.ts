import type { CHAT_MESSAGES, MessageWithMetadata } from "./fromServer";

export type ToPubsub = {
  type: typeof CHAT_MESSAGES;
  payload: { messages: MessageWithMetadata[] };
};
