import { CHAT_MESSAGES, Message, SUBSCRIBE, UNSUBSCRIBE } from "./fromServer";

export type SubscriptionType = "collection" | "individual";
export type SubscriptionMessage = {
  type: SubscriptionType;
  room: string;
};

export type ToServer =
  | {
      type: typeof CHAT_MESSAGES;
      payload: {
        messages: {
          client_generated_uuid: string;
          message: string;
        }[];
        type: SubscriptionType;
        room: string;
      };
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
