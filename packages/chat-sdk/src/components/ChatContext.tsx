import React, { useContext } from "react";
import type {
  EnrichedMessage,
  EnrichedMessageWithMetadata,
  SubscriptionType,
  UserMetadata,
} from "@coral-xyz/common";

import type { AboveMessagePlugin } from "./ChatRoom";
export type MessagePlugins = "secure-transfer" | "barter" | "nft-sticker";

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
  usersMetadata: { [key: string]: UserMetadata };
  openPlugin: MessagePlugins;
  setOpenPlugin: any;
  aboveMessagePlugin: AboveMessagePlugin;
  setAboveMessagePlugin: React.Dispatch<
    React.SetStateAction<AboveMessagePlugin>
  >;
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
  usersMetadata: { [key: string]: UserMetadata };
  openPlugin: MessagePlugins;
  setOpenPlugin: any;
  aboveMessagePlugin: AboveMessagePlugin;
  setAboveMessagePlugin: React.Dispatch<
    React.SetStateAction<AboveMessagePlugin>
  >;
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
        usersMetadata: props.usersMetadata,
        openPlugin: props.openPlugin,
        setOpenPlugin: props.setOpenPlugin,
        aboveMessagePlugin: props.aboveMessagePlugin,
        setAboveMessagePlugin: props.setAboveMessagePlugin,
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
