import type { CHAT_MESSAGES, SUBSCRIBE, UNSUBSCRIBE } from "./fromServer";

export type SubscriptionType = "collection" | "individual";
export type SubscriptionMessage = {
  type: SubscriptionType;
  room: string;
};

export type MessageKind = "gif" | "text" | "secure-transfer" | "media";

export type MessageMetadata =
  | {
      signature: string;
      counter: string;
      escrow: string;
      final_txn_signature?: string;
      current_state: "pending" | "cancelled" | "redeemed";
    }
  | {
      mediaKind: "image" | "video";
      mediaLink: string;
    };

export type SendMessagePayload = {
  messages: {
    client_generated_uuid: string;
    message: string;
    message_kind: MessageKind;
    message_metadata?: MessageMetadata;
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
        publicKey?: string;
        mint?: string;
      };
    }
  | {
      type: typeof UNSUBSCRIBE;
      payload: {
        type: SubscriptionType;
        room: string;
        publicKey?: string;
        mint?: string;
      };
    };

export interface RemoteUserData {
  id: string;
  image: string;
  areFriends: boolean;
  requested: boolean;
  remoteRequested: boolean;
  username: string;
}

export interface CollectionChatData {
  collectionId: string;
  lastReadMessage?: string;
  lastMessage?: string;
  lastMessageUuid?: string;
}
