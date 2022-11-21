import { Button, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getHeaderTitle } from "@react-navigation/elements";
import { createStackNavigator } from "@react-navigation/stack";
import AppListScreen from "@screens/Unlocked/AppListScreen";
import BalancesScreen from "@screens/Unlocked/BalancesScreen";
import NftCollectiblesScreen from "@screens/Unlocked/NftCollectiblesScreen";

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
          component={AccountSettingsModal}
        />
        <Stack.Screen
          name="RecentActivityModal"
          component={RecentActivityModal}
        />
        <Stack.Screen name="ReceiveModal" component={AccountSettingsModal} />
        <Stack.Screen name="SendModal" component={RecentActivityModal} />
        <Stack.Screen name="SwapModal" component={RecentActivityModal} />
      </Stack.Group>
    </Stack.Navigator>
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
          onPress={() => navigation.navigate("RecentActivityModal")}
          title="Activity"
        />
        <Button
          onPress={() => navigation.navigate("AccountSettingsModal")}
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
      <Tab.Screen name="Applications" component={AppListScreen} />
      <Tab.Screen name="Collectibles" component={NftCollectiblesScreen} />
    </Tab.Navigator>
  );
}
