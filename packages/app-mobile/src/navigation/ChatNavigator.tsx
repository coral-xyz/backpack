import type {
  CollectionChatData,
  EnrichedInboxDb,
  RemoteUserData,
  SubscriptionType,
} from "@coral-xyz/common";

import { useState, useEffect, useCallback } from "react";
import { Text } from "react-native";

import {
  useFriendships,
  useGroupCollections,
  useRequestsCount,
  useUser,
} from "@coral-xyz/recoil";
import { SignalingManager, useChatsWithMetadata } from "@coral-xyz/tamagui";
import { createStackNavigator } from "@react-navigation/stack";
import { GiftedChat } from "react-native-gifted-chat";

import { MessageList } from "~components/Messages";
import {
  messagesTabChats,
  DATA,
  CHAT_COLLECTION,
  CHAT_INDIVIDUAL,
} from "~components/data";
import { Screen } from "~components/index";
import { Inbox } from "~components/messaging/Inbox";

type ChatType =
  | { chatType: "individual"; chatProps: EnrichedInboxDb }
  | { chatType: "collection"; chatProps: CollectionChatData };

const formatDate = (created_at: string) => {
  return !isNaN(new Date(parseInt(created_at, 10)).getTime())
    ? new Date(parseInt(created_at, 10)).getTime()
    : 0;
};

export function ChatListScreen({ navigation }): JSX.Element {
  // const theme = useTheme();
  const { uuid } = useUser();
  const activeChats = useFriendships({ uuid });
  const requestCount = useRequestsCount({ uuid });
  const groupCollections = useGroupCollections({ uuid });

  const getDefaultChats = () => {
    return groupCollections.filter((x) => x.name && x.image) || [];
  };

  const handlePressMessage = (
    roomId: string,
    roomType: SubscriptionType,
    roomName: string
  ) => {
    navigation.navigate("ChatDetail", { roomId, roomType, roomName });
  };

  const allChats: ChatType[] = [
    ...getDefaultChats().map((x) => ({ chatProps: x, chatType: "collection" })),
    ...(activeChats || []).map((x) => ({
      chatProps: x,
      chatType: "individual",
    })),
  ].sort((a, b) =>
    a.last_message_timestamp < b.last_message_timestamp ? -1 : 1
  );

  return (
    <Screen>
      <MessageList
        requestCount={requestCount}
        allChats={allChats}
        onPressRow={handlePressMessage}
      />
    </Screen>
  );
}

export function ChatDetailScreen({ navigation, route }): JSX.Element {
  const { roomType, roomId } = route.params;
  const { username, uuid } = useUser();
  const { chats } = useChatsWithMetadata({
    room: roomId.toString(),
    type: roomType,
  });

  // const [messages, setMessages] = useState([]);

  const messages = chats.map((x) => {
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

  // useEffect(() => {
  //
  //   setMessages(messages);
  // }, [chats]);

  const onSend = useCallback((messages = []) => {
    // setMessages((previousMessages) =>
    //   GiftedChat.append(previousMessages, messages)
    // );
  }, []);

  return (
    <GiftedChat
      scrollToBottom
      renderAvatarOnTop
      renderUsernameOnMessage
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: uuid,
        name: username,
      }}
    />
  );
}

const Stack = createStackNavigator();
export function ChatNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Messages" }}
      />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={({ route }) => ({ title: route.params.roomName })}
      />
    </Stack.Navigator>
  );
}
