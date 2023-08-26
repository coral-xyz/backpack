import { useState, Suspense, useCallback, useMemo } from "react";

import * as Crypto from "expo-crypto";

import {
  fetchMoreChatsFor,
  SignalingManager,
  useChatsWithMetadata,
} from "@coral-xyz/chat-xplat";
import { CHAT_MESSAGES } from "@coral-xyz/common";
import { createEmptyFriendship } from "@coral-xyz/db";
import { useUser, useAvatarUrl } from "@coral-xyz/recoil";
import { ErrorBoundary } from "react-error-boundary";
import { GiftedChat, Send } from "react-native-gifted-chat";
import { v4 as uuidv4 } from "uuid";

import { UserAvatar } from "~components/UserAvatar";
import { ScreenError, ScreenLoading } from "~components/index";
import { ChatDetailScreenProps } from "~navigation/types";

function generateId() {
  return Crypto.randomUUID();
}

const formatDate = (created_at: string) => {
  return !isNaN(new Date(parseInt(created_at, 10)).getTime())
    ? new Date(parseInt(created_at, 10)).getTime()
    : 0;
};

const formatChats = (chats) => {
  return chats
    .map((x) => {
      return {
        _id: x.client_generated_uuid,
        text: x.message,
        createdAt: formatDate(x.created_at),
        received: x.received,
        sent: true,
        pending: false,
        user: {
          _id: x.uuid,
          name: x.username,
          avatar: x.image,
        },
      };
    })
    .reverse();
};

function Container({ route }: ChatDetailScreenProps): JSX.Element {
  const { roomType, roomId, remoteUserId, remoteUsername } = route.params;
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const user = useUser();
  const avatarUrl = useAvatarUrl();
  const { chats } = useChatsWithMetadata({
    room: roomId.toString(),
    type: roomType,
  });

  const messages = useMemo(() => formatChats(chats), [chats]);

  const onLoadEarlier = useCallback(async () => {
    setIsLoadingEarlier(true);
    try {
      await fetchMoreChatsFor(user.uuid, roomId.toString(), roomType);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingEarlier(false);
    }
  }, [roomId, roomType, user.uuid]);

  const onSend = useCallback(
    async (messages = []) => {
      const [message] = messages;
      if (!message) {
        return;
      }

      // @ts-ignore
      const messageText = message?.text;
      const client_generated_uuid = uuidv4();

      if (chats.length === 0 && roomType === "individual") {
        // If it's the first time the user is interacting,
        // create an in memory friendship
        await createEmptyFriendship(user.uuid, remoteUserId || "", {
          last_message_sender: user.uuid,
          last_message_timestamp: new Date().toISOString(),
          last_message: messageText,
          last_message_client_uuid: client_generated_uuid,
          remoteUsername,
          id: roomId.toString(),
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
              client_generated_uuid,
              message: messageText,
              message_kind: "text",
            },
          ],
          type: roomType,
          room: roomId.toString(),
        },
      });
    },
    [chats.length, roomId, roomType, user.uuid, remoteUserId, remoteUsername]
  );

  const renderSend = useCallback((props) => {
    return <Send {...props} />;
  }, []);

  const renderAvatar = useCallback((props) => {
    return <UserAvatar uri={props.currentMessage.user.avatar} size={32} />;
  }, []);

  return (
    <GiftedChat
      multiline={false}
      textInputProps={{
        autoCorrect: false,
        autoCapitalize: "none",
        textContentType: "none",
      }}
      messageIdGenerator={generateId}
      showAvatarForEveryMessage
      alwaysShowSend
      loadEarlier
      infiniteScroll
      onLoadEarlier={onLoadEarlier}
      isLoadingEarlier={isLoadingEarlier}
      inverted
      messages={messages}
      onSend={onSend}
      renderSend={renderSend}
      renderAvatar={renderAvatar}
      user={{
        _id: user.uuid,
        name: user.username,
        avatar: avatarUrl,
      }}
    />
  );
}

export function ChatDetailScreen({
  navigation,
  route,
}: ChatDetailScreenProps): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
