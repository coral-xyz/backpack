import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SubscriptionType } from "@coral-xyz/common";
import { SUBSCRIBE } from "@coral-xyz/common";
import {
  refreshChatsFor,
  SignalingManager,
  useChatsWithMetadata,
} from "@coral-xyz/react-common";
import { useUser } from "@coral-xyz/recoil";

import { MessagePluginRenderer } from "../MessagePluginRenderer";
import { PLUGIN_HEIGHT_PERCENTAGE } from "../utils/constants";

import type { MessagePlugins } from "./ChatContext";
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

export type AboveMessagePlugin =
  | {
      type: "secure-transfer";
      metadata: {};
    }
  | {
      type: "nft-sticker";
      metadata: {
        mint: string;
      };
    }
  | {
      type: "";
    };

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
  const { uuid } = useUser();
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
  const [jumpToBottom, setShowJumpToBottom] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const [openPlugin, setOpenPlugin] = useState<MessagePlugins>("");
  const [aboveMessagePlugin, setAboveMessagePlugin] =
    useState<AboveMessagePlugin>({ type: "" });

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
      SignalingManager.getInstance().send({
        type: SUBSCRIBE,
        payload: {
          type,
          room: roomId,
          mint: nftMint,
          publicKey,
        },
      });
    }
    return () => {};
  }, [roomId]);

  useEffect(() => {
    if (
      existingChatRef.current &&
      JSON.stringify(chats) === JSON.stringify(existingChatRef.current)
    ) {
      return;
    }
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

    //@ts-ignore
    const scrollContainer = messageRef?.container?.children?.[0];
    let counter = chats ? chats?.length - 1 : 0;
    if (
      scrollContainer &&
      existingChatRef.current?.[existingChatRef.current.length - 1]
        ?.client_generated_uuid !== chats[counter]?.client_generated_uuid
    ) {
      if (
        scrollContainer.scrollHeight -
          scrollContainer.scrollTop -
          scrollContainer.clientHeight >
        10
      ) {
        while (counter > 0) {
          if (
            existingChatRef.current?.[existingChatRef.current.length - 1]
              ?.client_generated_uuid === chats[counter]?.client_generated_uuid
          ) {
            break;
          }
          if (chats[counter].from_http_server) {
            // only websocket messages should appear as unread
            break;
          }
          if (chats[counter].uuid === uuid) {
            break;
          }

          counter--;
        }

        setLocalUnreadCount((x) => x + chats.length - 1 - counter);
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
      openPlugin={openPlugin}
      setOpenPlugin={setOpenPlugin}
      aboveMessagePlugin={aboveMessagePlugin}
      setAboveMessagePlugin={setAboveMessagePlugin}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: !openPlugin
              ? "100vh"
              : `${100 - PLUGIN_HEIGHT_PERCENTAGE}vh`,
          }}
        >
          <FullScreenChat
            setLocalUnreadCount={setLocalUnreadCount}
            localUnreadCount={localUnreadCount}
            jumpToBottom={jumpToBottom}
            setShowJumpToBottom={setShowJumpToBottom}
            messageRef={messageRef}
            setMessageRef={setMessageRef}
          />
        </div>
        <div>
          <MessagePluginRenderer />
        </div>
      </div>
    </ChatProvider>
  );
};
