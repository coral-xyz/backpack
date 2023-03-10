import React, { useContext } from "react";
import type {
  EnrichedMessageWithMetadata,
  MessageKind,
  MessageMetadata,
  SubscriptionType,
  UserMetadata,
} from "@coral-xyz/common";

import type { AboveMessagePlugin } from "./ChatRoom";

export type MessagePlugins =
  | {
      type: "barter";
      metadata: {
        barterId?: string;
      };
    }
  | {
      type: "";
      metadata: {};
    };

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
  selectedFile: any;
  setSelectedFile: any;
  uploadingFile: boolean;
  setUploadingFile: any;
  inputRef: any;
  selectedMediaKind: any;
  setSelectedMediaKind: any;
  uploadedImageUri: any;
  setUploadedImageUri: any;
  sendMessage: (
    messageTxt: string,
    messageKind?: MessageKind,
    messageMetadata?: MessageMetadata
  ) => void;
};

interface ChatContextWithChildren extends ChatContext {
  children: any;
}

export const _ChatContext = React.createContext<ChatContext | null>(null);

export function ChatProvider(props: ChatContextWithChildren) {
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
        selectedFile: props.selectedFile,
        setSelectedFile: props.setSelectedFile,
        uploadingFile: props.uploadingFile,
        setUploadingFile: props.setUploadingFile,
        inputRef: props.inputRef,
        selectedMediaKind: props.selectedMediaKind,
        setSelectedMediaKind: props.setSelectedMediaKind,
        uploadedImageUri: props.uploadedImageUri,
        setUploadedImageUri: props.setUploadedImageUri,
        sendMessage: props.sendMessage,
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
