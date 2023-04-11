import { useCallback } from "react";
import { Text, View, Button, Pressable, ScrollView } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import { WalletTokenList } from "~components/Wallets";
import { Screen } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import {
  BalanceListScreen,
  BalanceDetailScreen,
} from "~screens/Unlocked/BalancesScreen";
import { MainWalletList } from "~screens/Unlocked/WalletListScreen";
import { BalanceSummaryWidget } from "~screens/Unlocked/components/BalanceSummaryWidget";
import { NftCollectionListScreen } from "~screens/WalletsV2NftListScreen";

function MainButton({
  onPressMain,
  onPressCopy,
}: {
  onPressMain: () => void;
  onPressCopy: () => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 22,
        borderRadius: 32,
        borderWidth: 2,
        backgroundColor: theme.custom.colors.nav,
        borderColor: theme.custom.colors.borderFull,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Pressable onPress={onPressMain}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Main</Text>
      </Pressable>
      <Pressable onPress={onPressCopy} style={{ marginLeft: 8 }}>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
      </Pressable>
    </View>
  );
}

function TokenDetail({ navigation, route }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingTop: 40 }}>
      <Text>Token Detail </Text>
    </View>
  );
}

function WalletPicker({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingTop: 40 }}>
      <Text>Wallet Picker</Text>
    </View>
  );
}

function NotificationsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingTop: 40 }}>
      <Text>Notifications</Text>
    </View>
  );
}

function TokenScreen({ navigation }) {
  return (
    <View style={{ flex: 1, paddingTop: 24 }}>
      <WalletTokenList
        onPressToken={(id: string) => {
          navigation.push("TokenDetail", { id });
        }}
      />
    </View>
  );
}

function CollectionScreen({ route }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Collection</Text>
    </View>
  );
}

function ActivityScreen({ route }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Activity</Text>
    </View>
  );
}

const TopTabs = createMaterialTopTabNavigator();

function Tabs() {
  return (
    <TopTabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#000",
        tabBarLabelStyle: { fontSize: 14 },
        // tabBarStyle: { marginHorizontal: 32 },
      }}
    >
      <TopTabs.Screen name="Tokens" component={TokenScreen} />
      <TopTabs.Screen name="Collection" component={NftCollectionListScreen} />
      <TopTabs.Screen name="Activity" component={ActivityScreen} />
    </TopTabs.Navigator>
  );
}

function AllAccountsScreen({ navigation }) {
  const handlePressWallet = useCallback((wallet) => {
    navigation.push("Main", { wallet });
  }, []);

  return (
    <Screen>
      <BalanceSummaryWidget />
      <MainWalletList onPressWallet={handlePressWallet} />
    </Screen>
  );
}

const Stack = createStackNavigator();
export function WalletsNavigator(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="AllAccountsHome">
      <Stack.Screen
        name="AllAccountsHome"
        component={AllAccountsScreen}
        options={{ title: "Your Wallets" }}
      />
      <Stack.Screen
        name="Main"
        component={Tabs}
        options={({ navigation }) => {
          return {
            headerShadowVisible: false,
            headerBackTitleVisible: false,
            headerTitle: (props) => {
              return (
                <MainButton
                  onPressMain={() => navigation.navigate("wallet-picker")}
                />
              );
            },
            headerRight: (props) => {
              return (
                <MaterialIcons.Button
                  name="notifications"
                  color="gray"
                  size={32}
                  onPress={() => navigation.push("Notifications")}
                  style={{
                    padding: 0,
                    margin: 0,
                    backgroundColor: "white",
                  }}
                />
              );
            },
          };
        }}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="TokenDetail" component={BalanceDetailScreen} />
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name="WalletPicker" component={WalletPicker} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
