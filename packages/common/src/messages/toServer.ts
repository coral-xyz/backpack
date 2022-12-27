import type { CHAT_MESSAGES, SUBSCRIBE, UNSUBSCRIBE } from "./fromServer";

export type SubscriptionType = "collection" | "individual";
export type SubscriptionMessage = {
  type: SubscriptionType;
  room: string;
};

export type SendMessagePayload = {
  messages: {
    client_generated_uuid: string;
    message: string;
    message_kind: "gif" | "text";
    parent_client_generated_uuid?: string;
  }[];
  type: SubscriptionType;
  room: string;
};

export type ToServer =
  | {
      type: typeof CHAT_MESSAGES;
      payload: SendMessagePayload;
    }
  | {
      type: typeof SUBSCRIBE;
      payload: {
        type: SubscriptionType;
        room: string;
      };
    }
  | {
      type: typeof UNSUBSCRIBE;
      payload: {
        type: SubscriptionType;
        room: string;
      };
    };
