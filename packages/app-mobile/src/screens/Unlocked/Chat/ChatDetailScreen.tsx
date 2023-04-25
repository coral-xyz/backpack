import type { StackScreenProps } from "@react-navigation/stack";

import { useState, useCallback, useMemo } from "react";

import * as Crypto from "expo-crypto";

// import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";

import { CHAT_MESSAGES } from "@coral-xyz/common";
import { createEmptyFriendship } from "@coral-xyz/db";
import { useUser, useAvatarUrl } from "@coral-xyz/recoil";
import {
  fetchMoreChatsFor,
  SignalingManager,
  useChatsWithMetadata,
} from "@coral-xyz/tamagui";
import { GiftedChat, Send } from "react-native-gifted-chat";
import { v4 as uuidv4 } from "uuid";

import { UserAvatar } from "~components/UserAvatar";
import { ChatStackNavigatorParamList } from "~screens/Unlocked/Chat/ChatHelpers";

const generateId = () => {
  return Crypto.randomUUID();
};

// function VideoMessage() {
//   const video = useRef(null);
//   const [status, setStatus] = useState<AVPlaybackStatus | object>({});
//   return (
//     <View>
//       <Video
//         ref={video}
//         style={{ width: 150, height: 100 }}
//         source={{
//           uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
//         }}
//         useNativeControls
//         resizeMode={ResizeMode.CONTAIN}
//         isLooping
//         onPlaybackStatusUpdate={(status) => setStatus(() => status)}
//       />
//       <View>
//         <Button
//           title={status.isPlaying ? "Pause" : "Play"}
//           onPress={() =>
//             status.isPlaying
//               ? video.current.pauseAsync()
//               : video.current.playAsync()
//           }
//         />
//       </View>
//     </View>
//   );
// }

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
    })
    .reverse();
};

export function ChatDetailScreen({
  // navigation,
  route,
}: StackScreenProps<ChatStackNavigatorParamList, "ChatDetail">): JSX.Element {
  const { roomType, roomId, remoteUserId, remoteUsername } = route.params;
  const user = useUser();
  const avatarUrl = useAvatarUrl();

  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
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

  // const renderMessageVideo = useCallback((props: MessageVideoProps<any>) => {
  //   const { video } = props.currentMessage;
  //   return <VideoMessage />;
  // }, []);

  const renderAvatar = useCallback((props) => {
    return <UserAvatar uri={props.currentMessage.user.avatar} size={32} />;
  }, []);

  return (
    <GiftedChat
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
      // renderMessageVideo={renderMessageVideo}
      user={{
        _id: user.uuid,
        name: user.username,
        avatar: avatarUrl,
      }}
    />
  );
}
