import React, { useEffect, useState } from "react";
import { ChatManager, Message } from "../ChatManager";
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
  const [chats, setChats] = useState<Message[]>([]);

  useEffect(() => {
    if (roomId) {
      const chatManager = new ChatManager(
        userId,
        "kira",
        roomId,
        (messages) => {
          setChats((m) => [...m, ...messages]);
        },
        (messages) => {
          setChats((m) =>
            m.map((message) => {
              if (message.uuid !== userId) {
                return message;
              }
              console.log(`inside2 for ${message.message}`);
              const receivedMessage = messages.find(
                (x) => x.client_generated_uuid === message.client_generated_uuid
              );
              if (receivedMessage) {
                console.log(`inside3 for ${message.message}`);
                return {
                  ...message,
                  received: true,
                };
              }
              console.log(`inside4 for ${message.message}`);
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
