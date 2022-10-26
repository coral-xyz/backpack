import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useBlockchainTokensSorted,
} from "@coral-xyz/recoil";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getHeaderTitle } from "@react-navigation/elements";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, Pressable, Text, View } from "react-native";
import tw from "twrnc";

import { Screen } from "@components";

import { CustomButton } from "../components/CustomButton";
import { ButtonFooter, MainContent } from "../components/Templates";

export default function UnlockedNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="Tabs" component={UnlockedBottomTabNavigator} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: "modal", headerShown: true }}>
        <Stack.Screen name="AccountSettings" component={AccountSettingsModal} />
        <Stack.Screen name="RecentActivity" component={RecentActivityModal} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function BalancesScreen() {
  const background = useBackgroundClient();
  //  const wallet = useActiveSolanaWallet();

  const tokenAccountsSorted = useBlockchainTokensSorted(Blockchain.SOLANA);
  return (
    <Screen>
      <MainContent>
        <View style={tw`bg-black p-4 rounded-xl`}>
          <Text style={tw`text-white text-xs`}>
            {JSON.stringify(tokenAccountsSorted)}
          </Text>
        </View>

        <Pressable>
          <Text style={tw`text-white text-xs`}>Receive</Text>
          <Text style={tw`text-white text-xs`}>Send</Text>
        </Pressable>

        <View style={tw`bg-black p-4 rounded-xl`}>
          <Text style={tw`text-white text-xs`}>Tokens</Text>
        </View>
      </MainContent>
      <ButtonFooter>
        <CustomButton
          text="Toggle Connection"
          onPress={() => {
            // navigate("/toggle-connection");
          }}
        />
        <CustomButton
          text="Lock"
          onPress={async () => {
            await background.request({
              method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
              params: [],
            });
            // navigate("/");
          }}
        />
      </ButtonFooter>
    </Screen>
  );
}

function AccountSettingsModal() {
  return (
    <View style={{ flex: 1, backgroundColor: "green", alignItems: "center" }}>
      <Text>Account Settings</Text>
    </View>
  );
}

function RecentActivityModal() {
  return (
    <View style={{ flex: 1, backgroundColor: "green", alignItems: "center" }}>
      <Text>Recent Activity</Text>
    </View>
  );
}

function TabBarIcon(props) {
  return (
    <MaterialCommunityIcons size={30} style={{ marginBottom: -3 }} {...props} />
  );
}

function Header({ title, navigation }: { title: string; navigation: any }) {
  // TODO fix any
  return (
    <View
      style={{
        padding: 8,
        height: 54,
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text>{title}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Button
          onPress={() => navigation.navigate("RecentActivity")}
          title="Activity"
        />
        <Button
          onPress={() => navigation.navigate("AccountSettings")}
          title="Account Settings"
        />
      </View>
    </View>
  );
}

function UnlockedBottomTabNavigator() {
  const getIcon = (focused: boolean, routeName: string): string => {
    switch (routeName) {
      case "Balances":
        return focused ? "baguette" : "baguette";
      case "Applications":
        return focused ? "apps" : "apps";
      case "Collectibles":
        return focused ? "image" : "image";
      default:
        return "baguette";
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        header: ({ navigation, route, options }) => {
          const title = getHeaderTitle(options, route.name);
          return <Header title={title} navigation={navigation} />;
        },
        tabBarIcon: ({ focused, color, size }) => {
          const name = getIcon(focused, route.name);
          return <TabBarIcon size={size} name={name} color={color} />;
        },
        tabBarActiveTintColor: "#333",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Balances" component={BalancesScreen} />
      <Tab.Screen name="Applications" component={BalancesScreen} />
      <Tab.Screen name="Collectibles" component={BalancesScreen} />
    </Tab.Navigator>
  );
}
