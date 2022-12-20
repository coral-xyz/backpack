import React, { useEffect, useRef, useState } from "react";
import type { SubscriptionType } from "@coral-xyz/common";

import type { EnrichedMessage } from "../ChatManager";
import { ChatManager } from "../ChatManager";

import { ChatProvider } from "./ChatContext";
import { FullScreenChat } from "./FullScreenChat";

interface ChatRoomProps {
  roomId: string;
  userId: string;
  mode?: "fullscreen" | "minimized";
  type: SubscriptionType;
  username: string;
  areFriends?: boolean;
  requested?: boolean;
  remoteUserId?: string;
  blocked?: boolean;
  spam?: boolean;
  setRequested?: any;
  setSpam?: any;
  setBlocked?: any;
  isDarkMode: boolean;
  jwt: string;
  remoteRequested: boolean;
}

export const ChatRoom = ({
  roomId,
  userId,
  username,
  type = "collection",
  mode = "fullscreen",
  areFriends = true,
  requested = false,
  remoteUserId,
  blocked,
  spam,
  setRequested,
  setSpam,
  setBlocked,
  isDarkMode,
  jwt,
}: ChatRoomProps) => {
  const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  // TODO: Make state propogte from outside the state since this'll be expensive
  const [chats, setChats] = useState<EnrichedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReply, setActiveReply] = useState({
    parent_username: "",
    parent_client_generated_uuid: null,
    parent_message_author_uuid: "",
    text: "",
  });

  useEffect(() => {
    if (roomId) {
      const chatManager = new ChatManager(
        userId,
        roomId,
        type,
        jwt,
        (messages) => {
          setLoading(false);
          setChats((m) => [...m, ...messages]);
        },
        (messages) => {
          setChats((m) => [...messages, ...m]);
        },
        (messages) => {
          setChats((m) =>
            m.map((message) => {
              if (message.uuid !== userId) {
                return message;
              }
              const receivedMessage = messages.find(
                (x) => x.client_generated_uuid === message.client_generated_uuid
              );
              if (receivedMessage) {
                return {
                  ...message,
                  received: true,
                };
              }
              return message;
            })
          );
        }
      );

      setChatManager(chatManager);

      return () => {
        chatManager.destroy();
      };
    }
    return () => {};
  }, [roomId]);

  return (
    <ChatProvider
      activeReply={activeReply}
      setActiveReply={setActiveReply}
      loading={loading}
      chatManager={chatManager}
      roomId={roomId}
      chats={chats}
      setChats={setChats}
      userId={userId}
      username={username}
      areFriends={areFriends}
      requested={requested}
      remoteRequested={remoteRequested}
      remoteUserId={remoteUserId || ""}
      type={type}
      spam={spam}
      blocked={blocked}
      setRequested={setRequested}
      setSpam={setSpam}
      setBlocked={setBlocked}
      isDarkMode={isDarkMode}
    >
      <FullScreenChat />
    </ChatProvider>
  );
};
