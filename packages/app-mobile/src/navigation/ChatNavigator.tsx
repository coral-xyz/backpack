import type {
  CollectionChatData,
  EnrichedInboxDb,
  RemoteUserData,
} from "@coral-xyz/common";

import * as React from "react";
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

export function ChatDetailScreen() {
  return null;
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
