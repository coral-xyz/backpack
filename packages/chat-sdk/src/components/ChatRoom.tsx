import React, { useEffect, useState } from "react";
import { ChatManager, EnrichedMessage } from "../ChatManager";
import { useRef } from "react";
import { FullScreenChat } from "./FullScreenChat";
import { ChatProvider } from "./ChatContext";
import { SubscriptionType } from "@coral-xyz/common";

interface ChatRoomProps {
  roomId: string;
  userId: string;
  mode?: "fullscreen" | "minimized";
  type: SubscriptionType;
  username: string;
  areFriends?: boolean;
  requested?: boolean;
  remoteUserId?: string;
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
}: ChatRoomProps) => {
  const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  const messageContainerRef = useRef(null);
  // TODO: Make state propogte from outside the state since this'll be expensive
  const [chats, setChats] = useState<EnrichedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roomId) {
      const chatManager = new ChatManager(
        userId,
        roomId,
        type,
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
      loading={loading}
      chatManager={chatManager}
      roomId={roomId}
      chats={chats}
      setChats={setChats}
      userId={userId}
      username={username}
      areFriends={areFriends}
      requested={requested}
      remoteUserId={remoteUserId || ""}
      type={type}
    >
      <FullScreenChat />
    </ChatProvider>
  );
};
