import React, { useEffect, useState } from "react";
import { ChatManager, EnrichedMessage } from "../ChatManager";
import { useRef } from "react";
import { FullScreenChat } from "./FullScreenChat";
import { ChatProvider } from "./ChatContext";

interface ChatRoomProps {
  roomId: string;
  userId: string;
  mode?: "fullscreen" | "minimized";
}

export const ChatRoom = ({
  roomId,
  userId,
  mode = "fullscreen",
}: ChatRoomProps) => {
  const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  const messageContainerRef = useRef(null);
  // TODO: Make state propogte from outside the state since this'll be expensive
  const [chats, setChats] = useState<EnrichedMessage[]>([]);

  useEffect(() => {
    if (roomId) {
      const chatManager = new ChatManager(
        userId,
        roomId,
        (messages) => {
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
        console.error("unmounted");
        chatManager.destroy();
      };
    }
    return () => {};
  }, [roomId]);

  return (
    <ChatProvider
      chatManager={chatManager}
      roomId={roomId}
      chats={chats}
      setChats={setChats}
      userId={userId}
    >
      <FullScreenChat chats={chats} messageContainerRef={messageContainerRef} />
    </ChatProvider>
  );
};
