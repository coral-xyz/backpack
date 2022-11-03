import { Screen } from "@components";
import type { Blockchain } from "@coral-xyz/common";
import {
  ETH_NATIVE_MINT,
  NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
} from "@coral-xyz/common";
import {
  useAppIcons,
  useBackgroundClient,
  useBlockchainTokensSorted,
} from "@coral-xyz/recoil";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getHeaderTitle } from "@react-navigation/elements";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, FlatList, Pressable, Text, View } from "react-native";
import tw from "twrnc";

import { CustomButton } from "../components/CustomButton";
import { ButtonFooter, MainContent } from "../components/Templates";
import { RandomBackgroundScreen } from "../screens/Helpers/RandomBackgroundScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

type Plugin = {
  title: string;
  iconUrl: string;
  url: string;
  install: any;
};

function PluginGrid() {
  const plugins = useAppIcons();
  const background = useBackgroundClient();

  const onPressPlugin = (p: Plugin) => {
    // Update the URL to use the plugin.
    //
    // This will do two things
    //
    // 1. Update and persist the new url. Important so that if the user
    //    closes/re-opens the app, the plugin opens up immediately.
    // 2. Cause a reload of this route with the plguin url in the search
    //    params, which will trigger the drawer to activate.
    //
    const newUrl = `${location.pathname}${
      location.search
    }&plugin=${encodeURIComponent(p.install.account.xnft.toString())}`;
    console.log("onPressPlugin:newUrl", newUrl);
    // TODO(peter) probably Linking.openURL ?
    background
      .request({
        method: UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
        params: [newUrl],
      })
      .catch(console.error);
  };

  function renderItem({ item }) {
    return (
      <Pressable onPress={() => onPressPlugin(item)}>
        <View>
          <Text>{item.url}</Text>
        </View>
      </Pressable>
    );
  }

  // HACK: hide autoinstalled ONE xnft -> entrypoint in collectibles.
  const pluginsWithoutONExNFT = plugins.filter(
    (p) =>
      p.install.account.xfnit.toString() !==
      "4ekUZj2TKNoyCwnRDstvViCZYkhnhNoWNQpa5bBLwhq4"
  );

  return (
    <Screen>
      <FlatList
        data={pluginsWithoutONExNFT}
        numColumns={3}
        renderItem={renderItem}
        keyExtractor={(item) => item.url}
        initialNumToRender={12} // TODO
      />
    </Screen>
  );
}

function BalancesScreen() {
  console.log("balances");
  const background = useBackgroundClient();
  //  const wallet = useActiveSolanaWallet();

  function BalanceSummaryWidget() {
    return null;
  }

  function TransferWidget({ rampEnabled }) {
    return null;
  }

  function onPressTokenRow(blockchain: Blockchain, token: Token) {
    console.log("onPressTokenRow", blockchain, token);
  }

  function TokenTables({ onPressRow, customFilter }) {
    return null;
  }

  return (
    <Screen>
      <BalanceSummaryWidget />
      <View style={{ paddingVertical: 32 }}>
        <TransferWidget rampEnabled={true} />
      </View>
      <TokenTables
        onPressRow={onPressTokenRow}
        customFilter={(token) => {
          if (token.mint && token.mint === SOL_NATIVE_MINT) {
            return true;
          }
          if (token.address && token.address === ETH_NATIVE_MINT) {
            return true;
          }
          return !token.nativeBalance.isZero();
        }}
      />
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
          title="Account"
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
      <Tab.Screen name="Applications" component={RandomBackgroundScreen} />
      <Tab.Screen name="Collectibles" component={RandomBackgroundScreen} />
    </Tab.Navigator>
  );
}
