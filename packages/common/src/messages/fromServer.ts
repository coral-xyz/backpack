import type { ToPubsub } from "./ToPubsub";
import type {
  MessageKind,
  MessageMetadata,
  SubscriptionType,
} from "./toServer";
export const CHAT_MESSAGES = "CHAT_MESSAGES";
export const SUBSCRIBE = "SUBSCRIBE";
export const UNSUBSCRIBE = "UNSUBSCRIBE";
export const WS_READY = "WS_READY";

export interface Message {
  uuid: string;
  message: string;
  client_generated_uuid: string;
  message_kind: MessageKind;
  created_at: string;
  parent_client_generated_uuid?: string;
  room: string;
  type: SubscriptionType;
  message_metadata?: MessageMetadata;
}

export interface MessageWithMetadata extends Message {
  parent_message_text?: string;
  parent_message_author_uuid?: string;
}

export interface EnrichedMessage extends MessageWithMetadata {
  direction: "send" | "recv";
  received?: boolean;
  from_http_server: 0 | 1;
}

export interface EnrichedMessageWithMetadata extends EnrichedMessage {
  username: string;
  image: string;
  color?: string;
}

export interface UserMetadata {
  uuid: string;
  image: string;
  username: string;
  color?: string;
}

export type ReceiveChat = {
  type: SubscriptionType;
  room: string;
  message: string;
};

export type FromServer =
  | {
      type: typeof WS_READY;
      payload: {};
    }
  | ToPubsub;
