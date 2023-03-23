import * as React from "react";

import { createStackNavigator } from "@react-navigation/stack";

import { MessageList } from "~components/Messages";
import { messagesTabChats } from "~components/data";

export function ChatListScreen({ navigation }): JSX.Element {
  const handlePressMessage = (id: string) => {
    console.log("id", id);
    navigation.navigate("ChatDetail", { id });
  };

  return (
    <MessageList allChats={messagesTabChats} onPressRow={handlePressMessage} />
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
