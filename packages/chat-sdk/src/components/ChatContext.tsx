import React, { useContext } from "react";
import type {
  EnrichedMessageWithMetadata,
  SubscriptionType,
} from "@coral-xyz/common";

type ChatContext = {
  setActiveReply: any;
  activeReply: {
    parent_client_generated_uuid: string | null;
    text: string;
    parent_username: string;
    parent_message_author_uuid: string;
  };
  roomId: string;
  chats: EnrichedMessageWithMetadata[];
  userId: string;
  loading: boolean;
  username: string;
  areFriends: boolean;
  requested: boolean;
  remoteRequested: boolean;
  remoteUserId: string;
  type: SubscriptionType;
  blocked?: boolean;
  spam?: boolean;
  setRequested?: any;
  setSpam?: any;
  setBlocked?: any;
  isDarkMode: boolean;
  remoteUsername?: string;
  reconnecting: boolean;
  nftMint?: string;
  publicKey?: string;
};

export const _ChatContext = React.createContext<ChatContext | null>(null);

export function ChatProvider(props: {
  setActiveReply: any;
  activeReply: {
    parent_client_generated_uuid: string | null;
    text: string;
    parent_username: string;
    parent_message_author_uuid: string;
  };
  roomId: string;
  chats: EnrichedMessageWithMetadata[];
  userId: string;
  children: any;
  loading: boolean;
  username: string;
  areFriends: boolean;
  requested: boolean;
  remoteRequested: boolean;
  remoteUserId: string;
  type: SubscriptionType;
  blocked?: boolean;
  spam?: boolean;
  setRequested?: any;
  setSpam?: any;
  setBlocked?: any;
  isDarkMode: boolean;
  remoteUsername?: string;
  reconnecting: boolean;
  nftMint?: string;
  publicKey?: string;
}) {
  return (
    <_ChatContext.Provider
      value={{
        setActiveReply: props.setActiveReply,
        activeReply: props.activeReply,
        roomId: props.roomId,
        chats: props.chats,
        userId: props.userId,
        loading: props.loading,
        username: props.username,
        areFriends: props.areFriends,
        requested: props.requested,
        remoteUserId: props.remoteUserId,
        type: props.type,
        spam: props.spam,
        blocked: props.blocked,
        setRequested: props.setRequested,
        setSpam: props.setSpam,
        setBlocked: props.setBlocked,
        isDarkMode: props.isDarkMode,
        remoteRequested: props.remoteRequested,
        remoteUsername: props.remoteUsername,
        reconnecting: props.reconnecting,
        nftMint: props.nftMint,
        publicKey: props.publicKey,
      }}
    >
      {props.children}
    </_ChatContext.Provider>
  );
}

export function useChatContext(): ChatContext {
  const ctx = useContext(_ChatContext);
  if (!ctx) {
    throw new Error("context not found");
  }
  return ctx;
}
