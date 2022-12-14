import { Text, View } from "react-native";
import { NavHeader } from "@components";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AccountSettingsNavigator from "@navigation/AccountSettingsNavigator";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getHeaderTitle } from "@react-navigation/elements";
import { createStackNavigator } from "@react-navigation/stack";
import AppListScreen from "@screens/Unlocked/AppListScreen";
import { BalancesNavigator } from "@screens/Unlocked/BalancesScreen";
import {
  DepositListScreen,
  DepositSingleScreen,
} from "@screens/Unlocked/DepositScreen";
import { NFTCollectiblesNavigator } from "@screens/Unlocked/NftCollectiblesScreen";
import { RecentActivityScreen } from "@screens/Unlocked/RecentActivityScreen";
import {
  SelectSendTokenModal,
  SendTokenModal,
} from "@screens/Unlocked/SendTokenScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function UnlockedNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="Tabs" component={UnlockedBottomTabNavigator} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: "modal", headerShown: true }}>
        <Stack.Screen
          name="AccountSettingsModal"
          component={AccountSettingsNavigator}
        />
        <Stack.Screen
          name="RecentActivityModal"
          options={{ title: "Recent Activity" }}
          component={RecentActivityScreen}
        />
        <Stack.Screen
          options={{ title: "Deposit" }}
          name="DepositList"
          component={DepositListScreen}
        />
        <Stack.Screen
          options={{ title: "Deposit" }}
          name="DepositSingle"
          component={DepositSingleScreen}
        />
        <Stack.Screen
          options={{ title: "Select Token" }}
          name="SendSelectTokenModal"
          component={SelectSendTokenModal}
        />
        <Stack.Screen
          name="SendTokenModal"
          component={SendTokenModal}
          options={({ route }) => {
            return {
              title: route.params.title,
            };
          }}
        />
        <Stack.Screen
          options={{ title: "Swap" }}
          name="SwapModal"
          component={RecentActivityModal}
        />
      </Stack.Group>
    </Stack.Navigator>
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
          return <NavHeader title={title} navigation={navigation} />;
        },
        tabBarIcon: ({ focused, color, size }) => {
          const name = getIcon(focused, route.name);
          return <TabBarIcon size={size} name={name} color={color} />;
        },
        tabBarActiveTintColor: "#333",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Balances" component={BalancesNavigator} />
      <Tab.Screen name="Applications" component={AppListScreen} />
      <Tab.Screen name="Collectibles" component={NFTCollectiblesNavigator} />
    </Tab.Navigator>
  );
}
