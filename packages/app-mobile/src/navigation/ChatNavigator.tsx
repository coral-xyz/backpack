import { createStackNavigator } from "@react-navigation/stack";

import { ChatDetailScreen } from "~screens/Unlocked/Chat/ChatDetailScreen";
import type { ChatStackNavigatorParamList } from "~screens/Unlocked/Chat/ChatHelpers";
import { ChatListScreen } from "~screens/Unlocked/Chat/ChatListScreen";
import {
  ChatRequestScreen,
  ChatRequestDetailScreen,
} from "~screens/Unlocked/Chat/ChatRequestScreen";

const Stack = createStackNavigator<ChatStackNavigatorParamList>();
export function ChatNavigator(): JSX.Element {
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
      <Stack.Screen
        name="ChatRequest"
        component={ChatRequestScreen}
        options={{
          title: "Requests",
        }}
      />
      <Stack.Screen
        name="ChatRequestDetail"
        component={ChatRequestDetailScreen}
        options={({ route }) => ({ title: route.params.roomName })}
      />
    </Stack.Navigator>
  );
}
