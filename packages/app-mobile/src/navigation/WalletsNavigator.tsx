import { toTitleCase } from "@coral-xyz/common";
import { Box } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import { WalletSwitcherButton } from "~components/WalletSwitcherButton";
import { useTheme } from "~hooks/useTheme";
import { CollectionListScreen } from "~screens/CollectionListScreen";
import { HomeWalletListScreen } from "~screens/HomeWalletListScreen";
import { BalanceDetailScreen } from "~screens/Unlocked/BalancesScreen";
import { RecentActivityScreen } from "~screens/Unlocked/RecentActivityScreen__OLD";
import { WalletOverviewScreen } from "~screens/WalletOverviewScreen";
import { NftCollectionListScreen } from "~screens/WalletsV2NftListScreen";

const TopTabs = createMaterialTopTabNavigator();

function TopTabsNavigator(): JSX.Element {
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
      <TopTabs.Screen
        name="Collectibles"
        component={CollectionListScreen}
        options={{ title: "Collectibles" }}
      />
      <TopTabs.Screen
        name="Activity"
        component={RecentActivityScreen}
        options={{ title: "Activity" }}
      />
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
        component={TopTabsNavigator}
        options={({ navigation }) => {
          return {
            headerShadowVisible: false,
            headerBackTitleVisible: false,
            headerTitle: () => {
              return <WalletSwitcherButton />;
            },
            headerRight: () => {
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

      <Stack.Screen
        name="TokenDetail"
        component={BalanceDetailScreen}
        options={({
          route: {
            params: { blockchain, tokenTicker },
          },
        }) => {
          const title = `${toTitleCase(blockchain)} / ${tokenTicker}`;
          return {
            title,
          };
        }}
      />
    </Stack.Navigator>
  );
}
