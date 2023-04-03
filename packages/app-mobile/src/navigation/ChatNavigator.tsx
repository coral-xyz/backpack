import { createStackNavigator } from "@react-navigation/stack";

import { ChatDetailScreen } from "~screens/Unlocked/Chat/ChatDetailScreen";
import type { ChatStackNavigatorParamList } from "~screens/Unlocked/Chat/ChatHelpers";
import { ChatListScreen } from "~screens/Unlocked/Chat/ChatListScreen";

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
    </Stack.Navigator>
  );
}
