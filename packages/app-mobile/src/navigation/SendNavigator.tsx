import { createStackNavigator } from "@react-navigation/stack";

import { useTheme } from "~hooks/useTheme";
import {
  SendTokenConfirmScreen,
  SendTokenListScreen,
  SendTokenSelectRecipientScreen,
} from "~screens/Unlocked/SendTokenScreen";

import { Token } from "~types/types";

type SendStackNavigatorParamList = {
  SendSelectTokenModal: undefined;
  SendTokenModal: { token: Token };
  SendTokenConfirm: { token: Token };
};

const Stack = createStackNavigator<SendStackNavigatorParamList>();
export function SendNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        // headerShown: false,
        headerTintColor: theme.custom.colors.fontColor,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        options={{ title: "Select Token" }}
        name="SendSelectTokenModal"
        component={SendTokenListScreen}
      />
      <Stack.Screen
        name="SendTokenModal"
        component={SendTokenSelectRecipientScreen}
        options={({ route }) => {
          const { token } = route.params;
          return {
            title: `Send ${token.ticker}`,
          };
        }}
      />
      <Stack.Screen
        name="SendTokenConfirm"
        component={SendTokenConfirmScreen}
        options={({ route }) => {
          const { token } = route.params;
          return {
            title: `Send ${token.ticker}`,
          };
        }}
      />
    </Stack.Navigator>
  );
}
