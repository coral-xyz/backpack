import type { StackScreenProps } from "@react-navigation/stack";

import { useState, useEffect, useCallback } from "react";

import { CHAT_MESSAGES } from "@coral-xyz/common";
import { createEmptyFriendship } from "@coral-xyz/db";
import { useUser, useAvatarUrl } from "@coral-xyz/recoil";
import { SignalingManager, useChatsWithMetadata } from "@coral-xyz/tamagui";
import { GiftedChat } from "react-native-gifted-chat";
import { v4 as uuidv4 } from "uuid";

import { ChatStackNavigatorParamList } from "~screens/Unlocked/Chat/ChatHelpers";

const formatDate = (created_at: string) => {
  return !isNaN(new Date(parseInt(created_at, 10)).getTime())
    ? new Date(parseInt(created_at, 10)).getTime()
    : 0;
};

export function ChatDetailScreen({
  navigation,
  route,
}: StackScreenProps<ChatStackNavigatorParamList, "ChatDetail">): JSX.Element {
  const { roomType, roomId, remoteUserId, remoteUsername } = route.params;
  const user = useUser();
  const avatarUrl = useAvatarUrl();
  const { chats } = useChatsWithMetadata({
    room: roomId.toString(),
    type: roomType,
  });

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const _messages = chats.map((x) => {
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
    });

    setMessages(_messages);
  }, []);

  // not sure if any of this is working
  const onSend = useCallback(
    async (messages = []) => {
      const [message] = messages;
      if (!message) {
        return;
      }

      console.log("message", message);

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
        console.log("previousMessages", previousMessages);
        GiftedChat.append(previousMessages, messages);
      });
    },
    [chats.length, roomId, roomType, user.uuid, remoteUserId, remoteUsername]
  );

  return (
    <GiftedChat
      messageIdGenerator={() => uuidv4()}
      showAvatarForEveryMessage
      // always shows the send button, even if nothing is in chat (vs. only showing it when you type something in)
      alwaysShowSend
      // enable loading earlier messages via onLoadEarlier function
      loadEarlier
      // works with loadEarlier
      infiniteScroll
      // load earlier messages
      onLoadEarlier={console.log}
      // renders tickets for seeing message, etc
      // renderTicks={renderTicks}
      inverted
      messages={messages}
      onSend={onSend}
      user={{
        _id: user.uuid,
        name: user.username,
        avatar: avatarUrl,
      }}
    />
  );
}
