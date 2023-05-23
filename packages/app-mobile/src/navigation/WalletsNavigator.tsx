import { Dimensions } from "react-native";

import { Blockchain, toTitleCase } from "@coral-xyz/common";
import { Box } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  createStackNavigator,
  StackScreenProps,
} from "@react-navigation/stack";

import { WalletSwitcherButton } from "~components/WalletSwitcherButton";
import { useTheme } from "~hooks/useTheme";
import { CollectionDetailScreen } from "~screens/CollectionDetailScreen";
import { CollectionItemDetailScreen } from "~screens/CollectionItemDetailScreen";
import { CollectionListScreen } from "~screens/CollectionListScreen";
import { HomeWalletListScreen } from "~screens/HomeWalletListScreen";
import { RecentActivityScreen } from "~screens/RecentActivityScreen";
import { TokenDetailScreen } from "~screens/TokenDetailScreen";
import { TokenListScreen } from "~screens/TokenListScreen";

type TopTabsParamList = {
  TokenList: {
    blockchain: Blockchain;
    publicKey: string;
  };
  Collectibles: undefined;
  Activity: undefined;
};
const TopTabs = createMaterialTopTabNavigator<TopTabsParamList>();
function TopTabsNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <TopTabs.Navigator
      initialLayout={{
        width: Dimensions.get("window").width,
      }}
      screenOptions={{
        tabBarIndicatorStyle: {
          backgroundColor: theme.custom.colors.fontColor,
        },
        tabBarActiveTintColor: theme.custom.colors.fontColor,
        tabBarLabelStyle: {
          textTransform: "capitalize",
          fontSize: 15,
          fontFamily: "InterMedium",
          color: theme.custom.colors.fontColor,
        },
      }}
    >
      <TopTabs.Screen
        name="TokenList"
        component={TokenListScreen}
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

export type WalletStackParamList = {
  HomeWalletList: undefined;
  TopTabsWalletDetail: {
    blockchain: Blockchain;
    publicKey: string;
  };
  TokenDetail: undefined;
  // List of collectibles/nfts for a collection
  CollectionDetail: {
    id: string;
    title: string;
  };
  // individual collection/nft
  CollectionItemDetail: {
    id: string;
    title: string;
    blockchain: Blockchain;
  };
};

export type TokenDetailScreenParams = StackScreenProps<
  WalletStackParamList,
  "TokenDetail"
>;

const Stack = createStackNavigator<WalletStackParamList>();
export function WalletsNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeWalletList"
        component={HomeWalletListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TopTabsWalletDetail"
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
        component={TokenDetailScreen}
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
      <Stack.Screen
        name="CollectionDetail"
        component={CollectionDetailScreen}
        options={({
          route: {
            params: { title },
          },
        }) => {
          return {
            title,
          };
        }}
      />
      <Stack.Screen
        name="CollectionItemDetail"
        component={CollectionItemDetailScreen}
        options={({
          route: {
            params: { title },
          },
        }) => {
          return {
            title,
          };
        }}
      />
    </Stack.Navigator>
  );
}
