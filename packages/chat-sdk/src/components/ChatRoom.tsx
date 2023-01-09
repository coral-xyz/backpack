import React, { useEffect, useRef, useState } from "react";
import type { SubscriptionType } from "@coral-xyz/common";
import { SUBSCRIBE, UNSUBSCRIBE } from "@coral-xyz/common";
import {
  refreshChatsFor,
  SignalingManager,
  useRoomChatsWithMetadata,
} from "@coral-xyz/db";

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
  nftMint?: string;
  publicKey?: string;
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
  nftMint,
  publicKey,
}: ChatRoomProps) => {
  const [reconnecting, setReconnecting] = useState(false);
  // TODO: Make state propogte from outside the state since this'll be expensive
  const [activeReply, setActiveReply] = useState({
    parent_username: "",
    parent_client_generated_uuid: null,
    parent_message_author_uuid: "",
    text: "",
  });
  const chats = useRoomChatsWithMetadata(userId, roomId, type);
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    if (roomId) {
      refreshChatsFor(userId, roomId, type, nftMint, publicKey)
        .then(() => {
          setRefreshing(false);
        })
        .catch((e) => {
          setRefreshing(false);
        });
    }
  }, [roomId, userId, type]);

  useEffect(() => {
    if (roomId) {
      window.setTimeout(() => {
        // TODO : remote this timeout, caused because unsubsribe cleanup
        // is slow and 2 subsequent re-renders calls unsubscribe very slowly
        SignalingManager.getInstance().send({
          type: SUBSCRIBE,
          payload: {
            type,
            room: roomId,
            mint: nftMint,
            publicKey,
          },
        });
      }, 250);
      return () => {
        SignalingManager.getInstance().send({
          type: UNSUBSCRIBE,
          payload: {
            type,
            room: roomId,
            mint: nftMint,
            publicKey,
          },
        });
      };
    }
    return () => {};
  }, [roomId]);

  useEffect(() => {
    if (chats && chats.length) {
      SignalingManager.getInstance().debouncedUpdateLastRead(
        chats[chats.length - 1],
        publicKey,
        nftMint
      );
    }
  }, [chats]);

  return (
    <ChatProvider
      activeReply={activeReply}
      setActiveReply={setActiveReply}
      loading={!chats || (chats.length === 0 && refreshing)}
      roomId={roomId}
      chats={chats || []}
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
      nftMint={nftMint}
      publicKey={publicKey}
    >
      <FullScreenChat />
    </ChatProvider>
  );
};
