import type { SubscriptionType } from "./toServer";
export const CHAT_MESSAGES = "CHAT_MESSAGEES";
export const SUBSCRIBE = "SUBSCRIBE";
export const UNSUBSCRIBE = "UNSUBSCRIBE";
export const WS_READY = "WS_READY";

export interface Message {
  id: number;
  uuid?: string;
  message?: string;
  // received?: boolean;
  client_generated_uuid?: string;
  message_kind: "gif" | "text";
  created_at: string;
}

export interface MessageWithMetadata extends Message {
  username: string;
  image: string;
}

export type ReceiveChat = {
  type: SubscriptionType;
  room: string;
  message: string;
};

export type FromServer =
  | {
      type: typeof CHAT_MESSAGES;
      payload: {
        messages: Message[];
        type: SubscriptionType;
        room: string;
      };
    }
  | {
      type: typeof WS_READY;
      payload: {};
    };
