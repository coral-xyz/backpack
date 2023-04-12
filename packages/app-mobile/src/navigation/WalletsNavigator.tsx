import { useCallback } from "react";
import { Text, View, Button, Pressable, ScrollView } from "react-native";

import { NotificationsData, useActiveWallet } from "@coral-xyz/recoil";
import { Box, XStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TransferWidget } from "~components/Unlocked/Balances/TransferWidget";
import { WalletTokenList } from "~components/Wallets";
import { StyledText, Screen } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { BalanceDetailScreen } from "~screens/Unlocked/BalancesScreen";
import { RecentActivityScreen } from "~screens/Unlocked/RecentActivityScreen";
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
  const activeWallet = useActiveWallet();
  return (
    <XStack
      alignItems="center"
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
        <StyledText fontSize="$base" color="$fontColor">
          {activeWallet.name}
        </StyledText>
      </Pressable>
      <Pressable onPress={onPressCopy} style={{ marginLeft: 8 }}>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={24}
          color={theme.custom.colors.fontColor}
        />
      </Pressable>
    </XStack>
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
    <NotificationsData>
      {({ groupedNotifications }) => (
        <View style={{ flex: 1, alignItems: "center", paddingTop: 40 }}>
          <Text>Notifications</Text>
          <Text>{JSON.stringify(groupedNotifications)}</Text>
        </View>
      )}
    </NotificationsData>
  );
}

function TokenScreen({ navigation }) {
  return (
    <Screen>
      <BalanceSummaryWidget />
      <Box marginVertical={12}>
        <TransferWidget
          swapEnabled={false}
          rampEnabled={false}
          onPressOption={(route: string, options: NavTokenOptions) => {
            navigation.push(route, options);
          }}
        />
      </Box>
      <WalletTokenList
        onPressToken={(id: string) => {
          navigation.push("TokenDetail", { id });
        }}
      />
    </Screen>
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
  const theme = useTheme();
  return (
    <TopTabs.Navigator
      screenOptions={{
        tabBarIndicatorStyle: {
          backgroundColor: theme.custom.colors.fontColor,
        },
        tabBarActiveTintColor: theme.custom.colors.fontColor,
        tabBarLabelStyle: {
          textTransform: "capitalize",
          fontSize: 15,
          fontFamily: "Inter_500Medium",
          color: theme.custom.colors.fontColor,
        },
      }}
    >
      <TopTabs.Screen name="Tokens" component={TokenScreen} />
      <TopTabs.Screen name="Collectibles" component={NftCollectionListScreen} />
      <TopTabs.Screen name="Activity" component={RecentActivityScreen} />
    </TopTabs.Navigator>
  );
}

function AllAccountsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const handlePressWallet = useCallback((wallet) => {
    navigation.push("Main", { wallet });
  }, []);

  return (
    <Screen style={{ marginTop: insets.top }}>
      <BalanceSummaryWidget />
      <Box marginTop={12}>
        <MainWalletList onPressWallet={handlePressWallet} />
      </Box>
    </Screen>
  );
}

const Stack = createStackNavigator();
export function WalletsNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator initialRouteName="AllAccountsHome">
      <Stack.Screen
        name="AllAccountsHome"
        component={AllAccountsScreen}
        options={{ headerShown: false }}
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
                <Box m={8} mr={16}>
                  <MaterialIcons
                    name="search"
                    color={theme.custom.colors.fontColor}
                    size={28}
                    onPress={() => navigation.push("Notifications")}
                  />
                </Box>
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
