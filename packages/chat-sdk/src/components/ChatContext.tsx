import React, { useContext } from "react";
import { ChatManager, Message } from "../ChatManager";

type ChatContext = {
  chatManager: ChatManager | null;
  roomId: string;
  chats: Message[];
  setChats: any;
  userId: string;
};

export const _ChatContext = React.createContext<ChatContext | null>(null);

export function ChatProvider(props: {
  chatManager: ChatManager | null;
  roomId: string;
  chats: Message[];
  userId: string;
  setChats: any;
  children: any;
}) {
  return (
    <_ChatContext.Provider
      value={{
        chatManager: props.chatManager,
        roomId: props.roomId,
        chats: props.chats,
        setChats: props.setChats,
        userId: props.userId,
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
