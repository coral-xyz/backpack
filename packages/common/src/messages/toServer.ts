import type { Blockchain } from "../types";

import type { CHAT_MESSAGES, DELETE_MESSAGE,SUBSCRIBE, UNSUBSCRIBE  } from "./fromServer";
import { BarterOffers } from "./index";

export type SubscriptionType = "collection" | "individual";
export type SubscriptionMessage = {
  type: SubscriptionType;
  room: string;
};
export type BarterState = "in_progress" | "cancelled" | "executed";

export type MessageKind =
  | "gif"
  | "text"
  | "secure-transfer"
  | "media"
  | "transaction"
  | "barter"
  | "barter-request"
  | "nft-sticker";

export type MessageMetadata =
  | {
      signature: string;
      counter: string;
      escrow: string;
      final_txn_signature?: string;
      current_state: "pending" | ".cancelled" | "redeemed";
    }
  | {
      media_kind: "image" | "video";
      media_link: string;
    }
  | {
      contract_address: string;
    }
  | {
      on_chain_state: string;
      barter_id: number;
      state: BarterState;
    }
  | {
      mint: string;
    }
  | {
      barter_id: string;
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
      type: typeof DELETE_MESSAGE;
      payload: {
        client_generated_uuid: string;
        room: string;
        type: SubscriptionType;
      };
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
  searchedSolPubKey?: string; // Returns a public key if it is searched for
  searchedEthPubKey?: string;
  public_keys: {
    blockchain: Blockchain;
    publicKey: string;
  }[];
}

export interface CollectionChatData {
  collectionId: string;
  lastReadMessage?: string;
  lastMessage?: string;
  lastMessageUuid?: string;
  lastMessageTimestamp?: string;
  image?: string;
  name?: string;
}
