import { Text, View, Pressable } from "react-native";

import { NotificationsData, useActiveWallet } from "@coral-xyz/recoil";
import { Box, XStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import { StyledText } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { HomeWalletListScreen } from "~screens/HomeWalletListScreen";
import { BalanceDetailScreen } from "~screens/Unlocked/BalancesScreen";
import { RecentActivityScreen } from "~screens/Unlocked/RecentActivityScreen";
import { WalletOverviewScreen } from "~screens/WalletOverviewScreen";
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
      <TopTabs.Screen
        name="WalletOverview"
        component={WalletOverviewScreen}
        options={{ title: "Tokens" }}
      />
      <TopTabs.Screen name="Collectibles" component={NftCollectionListScreen} />
      <TopTabs.Screen name="Activity" component={RecentActivityScreen} />
    </TopTabs.Navigator>
  );
}

const Stack = createStackNavigator();
export function WalletsNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AllAccountsHome"
        component={HomeWalletListScreen}
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
