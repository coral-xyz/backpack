import type { StackScreenProps } from "@react-navigation/stack";

import { useState, useEffect, useCallback, useRef } from "react";
import { Platform, Button, View, Text } from "react-native";

import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";

import { CHAT_MESSAGES } from "@coral-xyz/common";
import { createEmptyFriendship } from "@coral-xyz/db";
import { useUser, useAvatarUrl } from "@coral-xyz/recoil";
import { SignalingManager, useChatsWithMetadata } from "@coral-xyz/tamagui";
import { GiftedChat, MessageVideoProps } from "react-native-gifted-chat";
import { v4 as uuidv4 } from "uuid";

import { ChatStackNavigatorParamList } from "~screens/Unlocked/Chat/ChatHelpers";

function VideoMessage() {
  const video = useRef(null);
  const [status, setStatus] = useState<AVPlaybackStatus | object>({});
  return (
    <View>
      <Video
        ref={video}
        style={{ width: 150, height: 100 }}
        source={{
          uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
      <View>
        <Button
          title={status.isPlaying ? "Pause" : "Play"}
          onPress={() =>
            status.isPlaying
              ? video.current.pauseAsync()
              : video.current.playAsync()
          }
        />
      </View>
    </View>
  );
}

const formatDate = (created_at: string) => {
  return !isNaN(new Date(parseInt(created_at, 10)).getTime())
    ? new Date(parseInt(created_at, 10)).getTime()
    : 0;
};

export function ChatDetailScreen({
  // navigation,
  route,
}: StackScreenProps<ChatStackNavigatorParamList, "ChatDetail">): JSX.Element {
  const { roomType, roomId, remoteUserId, remoteUsername } = route.params;
  const user = useUser();
  const avatarUrl = useAvatarUrl();

  // TODO(kirat)
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const { chats } = useChatsWithMetadata({
    room: roomId.toString(),
    type: roomType,
  });

  // TODO(kirat) load earlier chats
  const onLoadEarlier = () => {
    setIsLoadingEarlier(true);
    GiftedChat.prepend([], [], Platform.OS !== "web");

    setTimeout(() => {
      setIsLoadingEarlier(false);
    }, 250);
  };

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // TODO(kirat) messages are coming in in reverse order, despite `inverted={true}`
    // assuming this might have something to do with the time stamps being incorrect?
    const _messages = chats.map((x) => {
      return {
        _id: x.client_generated_uuid,
        text: x.message,
        createdAt: formatDate(x.created_at),
        received: x.received,
        sent: true,
        pending: false,
        // Videos / images follow this format
        // video:
        //   "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        // image:
        //   "https://d33wubrfki0l68.cloudfront.net/7e97b18b02060f1d4b65a5850b49e2488da391bb/d60ff/img/homepage/dissection/3.png",
        user: {
          _id: x.uuid,
          name: x.username,
          avatar: x.image,
        },
      };
    });

    setMessages(_messages);
  }, []);

  // TODO(kirat) not sure this is doing anything
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
              client_generated_uuid,
              message: messageText,
              message_kind: "text",
            },
          ],
          type: roomType,
          room: roomId.toString(),
        },
      });

      setMessages((previousMessages) => {
        GiftedChat.append(previousMessages, messages);
      });
    },
    [chats.length, roomId, roomType, user.uuid, remoteUserId, remoteUsername]
  );

  const renderMessageVideo = useCallback((props: MessageVideoProps<any>) => {
    const { video } = props.currentMessage;
    return <VideoMessage />;
  }, []);

  return (
    <GiftedChat
      messageIdGenerator={() => uuidv4()}
      showAvatarForEveryMessage
      alwaysShowSend
      loadEarlier
      infiniteScroll
      onLoadEarlier={onLoadEarlier}
      isLoadingEarlier={isLoadingEarlier}
      inverted
      messages={messages}
      onSend={onSend}
      renderMessageVideo={renderMessageVideo}
      user={{
        _id: user.uuid,
        name: user.username,
        avatar: avatarUrl,
      }}
    />
  );
}
