import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  MessageKind,
  MessageMetadata,
  SubscriptionType,
} from "@coral-xyz/common";
import { CHAT_MESSAGES, SUBSCRIBE } from "@coral-xyz/common";
import { createEmptyFriendship } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";
import {
  refreshChatsFor,
  refreshUpdatesFor,
  SignalingManager,
  useChatsWithMetadata,
} from "@coral-xyz/chat-xplat";
import { v4 as uuidv4 } from "uuid";

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
        // mint: string;
      };
    }
  | {
      type: "";
      metadata: {};
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
  const [messageRef, setMessageRef] = useState<any>(null);
  const [jumpToBottom, setShowJumpToBottom] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const [openPlugin, setOpenPlugin] = useState<MessagePlugins>({
    type: "",
    metadata: {},
  });
  const [aboveMessagePlugin, setAboveMessagePlugin] =
    useState<AboveMessagePlugin>({ type: "", metadata: {} });
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedMediaKind, setSelectedMediaKind] = useState<"image" | "video">(
    "image"
  );
  const [uploadedImageUri, setUploadedImageUri] = useState("");
  const inputRef = useRef<any>(null);

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

      refreshUpdatesFor(userId, roomId, type, nftMint || "", publicKey).catch(
        (e) => {
          console.error(`error while updating `);
          console.error(e);
        }
      );
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

  const sendMessage = async (
    messageTxt,
    messageKind: MessageKind = "text",
    messageMetadata?: MessageMetadata
  ) => {
    if (selectedFile && uploadingFile) {
      return;
    }
    if (messageTxt || selectedFile) {
      if (selectedFile) {
        messageKind = "media";
        messageMetadata = {
          media_kind: selectedMediaKind,
          media_link: uploadedImageUri,
        };
        setSelectedFile(null);
      }
      const client_generated_uuid = uuidv4();
      if (chats.length === 0 && type === "individual") {
        // If it's the first time the user is interacting,
        // create an in memory friendship
        await createEmptyFriendship(uuid, remoteUserId || "", {
          last_message_sender: uuid,
          last_message_timestamp: new Date().toISOString(),
          last_message:
            messageKind === "gif"
              ? "GIF"
              : messageKind === "secure-transfer"
              ? "Secure Transfer"
              : messageKind === "media"
              ? "Media"
              : messageTxt,
          last_message_client_uuid: client_generated_uuid,
          remoteUsername: remoteUsername,
          id: roomId,
        });
        SignalingManager.getInstance().onUpdateRecoil({
          type: "friendship",
        });
      }
      SignalingManager.getInstance()?.send({
        type: CHAT_MESSAGES,
        payload: {
          messages: [
            {
              client_generated_uuid: client_generated_uuid,
              message: messageTxt,
              message_kind: messageKind,
              message_metadata: messageMetadata,
              parent_client_generated_uuid:
                activeReply.parent_client_generated_uuid
                  ? activeReply.parent_client_generated_uuid
                  : undefined,
              //@ts-ignore
              parent_message_author_username:
                activeReply.parent_client_generated_uuid
                  ? activeReply.parent_username?.slice(1)
                  : undefined,
              //@ts-ignore
              parent_message_text: activeReply.parent_client_generated_uuid
                ? activeReply.text
                : undefined,
              parent_message_author_uuid:
                activeReply.parent_message_author_uuid,
            },
          ],
          type: type,
          room: roomId,
        },
      });

      /**
       * Why timeout?
       *
       * If we dont add timeout, the user will be scrolled to the last message at
       * that time, since the message sent by the user will be newly added.
       * So we need to add delay for scroll.
       */
      const timeoutId = setTimeout(() => {
        messageRef?.scrollToBottom?.();
        clearTimeout(timeoutId);
      }, 10);

      setActiveReply({
        parent_username: "",
        parent_client_generated_uuid: null,
        text: "",
        parent_message_author_uuid: "",
      });
      inputRef.current.setValue("");
    }
  };

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
      selectedFile={selectedFile}
      setSelectedFile={setSelectedFile}
      uploadingFile={uploadingFile}
      setUploadingFile={setUploadingFile}
      inputRef={inputRef}
      selectedMediaKind={selectedMediaKind}
      setSelectedMediaKind={setSelectedMediaKind}
      uploadedImageUri={uploadedImageUri}
      setUploadedImageUri={setUploadedImageUri}
      sendMessage={sendMessage}
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
            height: !openPlugin.type
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
