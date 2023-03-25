import type {
  CollectionChatData,
  EnrichedInboxDb,
  RemoteUserData,
} from "@coral-xyz/common";

import { useState, useEffect, useCallback } from "react";
import { Text } from "react-native";

import {
  useFriendships,
  useGroupCollections,
  useRequestsCount,
  useUser,
} from "@coral-xyz/recoil";
import { ListItem, AuthenticatedSync, Circle } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { GiftedChat } from "react-native-gifted-chat";

import { MessageList } from "~components/Messages";
import { messagesTabChats, DATA } from "~components/data";
import { Screen } from "~components/index";
import { Inbox } from "~components/messaging/Inbox";
import { useTheme } from "~hooks/useTheme";

export function ChatListScreen({ navigation }): JSX.Element {
  const theme = useTheme();
  const { uuid } = useUser();
  // const activeChats = useFriendships({ uuid });
  // const requestCount = useRequestsCount({ uuid });
  // const groupCollections = useGroupCollections({ uuid });
  const { activeChats, requestCount, groupCollections } = DATA;

  const getDefaultChats = () => {
    return groupCollections.filter((x) => x.name && x.image) || [];
  };

  const handlePressMessage = (id: string) => {
    console.log("id", id);
    navigation.navigate("ChatDetail", { id });
  };

  const allChats: (
    | { chatType: "individual"; chatProps: EnrichedInboxDb }
    | { chatType: "collection"; chatProps: CollectionChatData }
  )[] = [
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
  console.log("route.params", route.params);
  return <Example />;
}
export function Example() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://placeimg.com/140/140/any",
        },
      },
    ]);
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: 1,
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
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}
