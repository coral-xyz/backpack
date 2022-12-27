import React, { useEffect, useRef, useState } from "react";
import type { SubscriptionType } from "@coral-xyz/common";
import { refreshChatsFor, useRoomChatsWithMetadata } from "@coral-xyz/db";

import { ChatProvider } from "./ChatContext";
import { FullScreenChat } from "./FullScreenChat";

interface ChatRoomProps {
  roomId: string;
  userId: string;
  mode?: "fullscreen" | "minimized";
  type: SubscriptionType;
  username: string;
  remoteUsername?: string;
  areFriends?: boolean;
  requested?: boolean;
  remoteUserId?: string;
  blocked?: boolean;
  remoteRequested?: boolean;
  spam?: boolean;
  setRequested?: any;
  setSpam?: any;
  setBlocked?: any;
  isDarkMode: boolean;
}

export const ChatRoom = ({
  roomId,
  userId,
  username,
  remoteUsername,
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
  remoteRequested = false,
}: ChatRoomProps) => {
  // const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  // TODO: Make state propogte from outside the state since this'll be expensive
  const [loading, setLoading] = useState(true);
  const [activeReply, setActiveReply] = useState({
    parent_username: "",
    parent_client_generated_uuid: null,
    parent_message_author_uuid: "",
    text: "",
  });
  const chats = useRoomChatsWithMetadata(userId, roomId, type);

  useEffect(() => {
    if (roomId) {
      refreshChatsFor(userId, roomId, type)
        .then(() => setLoading(false))
        .catch((e) => setLoading(false));
      // const chatManager = new ChatManager(
      //   userId,
      //   roomId,
      //   type,
      //   jwt,
      //   (messages) => {
      //     setLoading(false);
      //     setChats((m) => merge(m, messages));
      //   },
      //   (messages) => {
      //     setChats((m) => merge(m, messages));
      //   },
      //   (messages) => {
      //     setChats((m) =>
      //       m.map((message) => {
      //         if (message.uuid !== userId) {
      //           return message;
      //         }
      //         const receivedMessage = messages.find(
      //           (x) => x.client_generated_uuid === message.client_generated_uuid
      //         );
      //         if (receivedMessage) {
      //           return {
      //             ...message,
      //             received: true,
      //           };
      //         }
      //         return message;
      //       })
      //     );
      //   }
      // );
      //
      // chatManager.on(RECONNECTING, () => {
      //   setReconnecting(true);
      // });
      //
      // chatManager.on(SIGNALING_CONNECTED, () => {
      //   setReconnecting(false);
      // });
      //
      // setChatManager(chatManager);
      //
      // return () => {
      //   chatManager.destroy();
      // };
    }
    return () => {};
  }, [roomId, userId, type]);

  return (
    <ChatProvider
      activeReply={activeReply}
      setActiveReply={setActiveReply}
      loading={loading}
      roomId={roomId}
      chats={chats}
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
      remoteUsername={remoteUsername}
      reconnecting={reconnecting}
    >
      <FullScreenChat />
    </ChatProvider>
  );
};
