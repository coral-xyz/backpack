import { View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import AccountSettingsScreen from "@screens/Unlocked/Settings/AccountSettingsScreen";
import { PreferencesScreen } from "@screens/Unlocked/Settings/PreferencesScreen";

const Stack = createStackNavigator();

function DummyScreen() {
  return <View style={{ flex: 1, backgroundColor: "red" }} />;
}

export default function AccountSettingsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        options={{ title: "Profile" }}
        name="AccountSettingsHome"
        component={AccountSettingsScreen}
      />
      <Stack.Screen
        options={{ title: "Your Account" }}
        name="YourAccount"
        component={DummyScreen}
      />
      <Stack.Screen
        options={{ title: "Preferences" }}
        name="Preferences"
        component={PreferencesScreen}
      />
      <Stack.Screen
        options={{ title: "xNFTs" }}
        name="xNFTSettings"
        component={DummyScreen}
      />
      <Stack.Screen
        options={{ title: "Waiting Room" }}
        name="WaitingRoom"
        component={DummyScreen}
      />
    </Stack.Navigator>
  );
}
