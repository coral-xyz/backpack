import React, { useContext } from "react";
import { ChatManager, EnrichedMessage } from "../ChatManager";

type ChatContext = {
  chatManager: ChatManager | null;
  roomId: string;
  chats: EnrichedMessage[];
  setChats: any;
  userId: string;
  loading: boolean;
  username: string;
};

export const _ChatContext = React.createContext<ChatContext | null>(null);

export function ChatProvider(props: {
  chatManager: ChatManager | null;
  roomId: string;
  chats: EnrichedMessage[];
  userId: string;
  setChats: any;
  children: any;
  loading: boolean;
  username: string;
}) {
  return (
    <_ChatContext.Provider
      value={{
        chatManager: props.chatManager,
        roomId: props.roomId,
        chats: props.chats,
        setChats: props.setChats,
        userId: props.userId,
        loading: props.loading,
        username: props.username,
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
