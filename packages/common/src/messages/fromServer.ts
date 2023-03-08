import type { ToPubsub } from "./ToPubsub";
import type {
  MessageKind,
  MessageMetadata,
  SubscriptionType,
} from "./toServer";
export const CHAT_MESSAGES = "CHAT_MESSAGES";
export const DELETE_MESSAGE = "DELETE_MESSAGE";
export const UPDATE_ACTIVE_BARTER = "UPDATE_ACTIVE_BARTER";
export const EXECUTE_BARTER = "EXECUTE_BARTER";
export const NOTIFICATION_ADD = "NOTIFICATION_ADD";
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
  deleted?: boolean;
}

export interface MessageWithMetadata extends Message {
  parent_message_text?: string;
  parent_message_author_uuid?: string;
}

export interface MessageUpdates {
  type: string;
  room: string;
  id: number;
  client_generated_uuid: string;
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
  colorIndex?: number;
  parent_message_author_username?: string;
}

export interface UserMetadata {
  uuid: string;
  image: string;
  username: string;
  color?: string;
  colorIndex: number;
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
