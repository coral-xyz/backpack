import * as React from "react";

import { createStackNavigator } from "@react-navigation/stack";

export function ChatListScreen() {
  return null;
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
