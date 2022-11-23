import { SubscriptionType } from "./toServer";
export const CHAT_MESSAGES = "CHAT_MESSAGEES";
export const SUBSCRIBE = "SUBSCRIBE";
export const UNSUBSCRIBE = "UNSUBSCRIBE";

export interface Message {
  id: number;
  username?: string;
  uuid?: string;
  message?: string;
  // received?: boolean;
  client_generated_uuid?: string;
}

export type ReceiveChat = {
  type: SubscriptionType;
  room: string;
  message: string;
};

export type FromServer = {
  type: typeof CHAT_MESSAGES;
  payload: {
    messages: Message[];
    type: SubscriptionType;
    room: string;
  };
};
