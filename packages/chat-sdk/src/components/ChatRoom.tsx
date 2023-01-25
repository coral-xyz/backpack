import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  EnrichedMessageWithMetadata,
  SubscriptionType,
} from "@coral-xyz/common";
import { EnrichedMessage, SUBSCRIBE, UNSUBSCRIBE } from "@coral-xyz/common";
import {
  refreshChatsFor,
  SignalingManager,
  useChatsWithMetadata,
} from "@coral-xyz/react-common";

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
  const existingChatRef = useRef<any>();
  const [scrollFromBottom, setScrollFromBottom] = useState<null | number>(null);
  // TODO: Make state propogte from outside the state since this'll be expensive
  const [activeReply, setActiveReply] = useState({
    parent_username: "",
    parent_client_generated_uuid: null,
    parent_message_author_uuid: "",
    text: "",
  });
  const { chats, usersMetadata } = useChatsWithMetadata({ room: roomId, type });
  const [refreshing, setRefreshing] = useState(true);
  const [messageRef, setMessageRef] = useState(null);

  useEffect(() => {
    if (roomId) {
      setRefreshing(true);
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
    if (
      existingChatRef.current &&
      existingChatRef.current[0]?.client_generated_uuid !==
        chats[0]?.client_generated_uuid
    ) {
      // a message was added to the top
      //@ts-ignore
      const element = messageRef?.container?.children?.[0];
      if (element) {
        setScrollFromBottom(element.scrollHeight - (element.scrollTop || 100));
      }
    }
    existingChatRef.current = chats;
  }, [chats]);

  useLayoutEffect(() => {
    if (scrollFromBottom || scrollFromBottom === 0) {
      //@ts-ignore
      const element = messageRef?.container?.children?.[0];
      if (element) {
        element.scrollTop = element.scrollHeight - scrollFromBottom;
      }
    }
    setScrollFromBottom(null);
  }, [scrollFromBottom, chats]);

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
      usersMetadata={usersMetadata}
    >
      <FullScreenChat messageRef={messageRef} setMessageRef={setMessageRef} />
    </ChatProvider>
  );
};
