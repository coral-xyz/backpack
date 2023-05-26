import { Alert, Dimensions, Platform } from "react-native";

import { Blockchain, toTitleCase } from "@coral-xyz/common";
import { StyledText } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import {
  PlatformPressable,
  HeaderBackButton,
  HeaderBackButtonProps,
} from "@react-navigation/elements";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  createStackNavigator,
  StackScreenProps,
} from "@react-navigation/stack";

import { WalletSwitcherButton } from "~components/WalletSwitcherButton";
import { Header } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { CollectionDetailScreen } from "~screens/CollectionDetailScreen";
import { CollectionItemDetailScreen } from "~screens/CollectionItemDetailScreen";
import { CollectionListScreen } from "~screens/CollectionListScreen";
import { HomeWalletListScreen } from "~screens/HomeWalletListScreen";
import { RecentActivityScreen } from "~screens/RecentActivityScreen";
import { TokenDetailScreen } from "~screens/TokenDetailScreen";
import { TokenListScreen } from "~screens/TokenListScreen";
import { WalletDisplayStarterScreen } from "~screens/WalletDisplayStarterScreen";

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
  WalletDisplayStarter: undefined;
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

type HeaderButtonProps = HeaderBackButtonProps & {
  name: string;
};

function HeaderButton({ name, tintColor, ...rest }: HeaderButtonProps) {
  return (
    <PlatformPressable style={{ marginHorizontal: 12 }} {...rest}>
      <MaterialIcons name={name} size={24} color={tintColor} />
    </PlatformPressable>
  );
}

const Stack = createStackNavigator<WalletStackParamList>();
export function WalletsNavigator(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="WalletDisplayStarter">
      <Stack.Screen
        name="WalletDisplayStarter"
        component={WalletDisplayStarterScreen}
        options={({ navigation }) => {
          return {
            headerShown: true,
            title: "Balances",
            headerLeft: (props) => (
              <HeaderButton
                name="settings"
                {...props}
                onPress={() => {
                  navigation.openDrawer();
                  // navigation.navigate("HomeWalletList");
                }}
              />
            ),
            headerRight: (props) => (
              <HeaderButton name="notifications" {...props} />
            ),
          };
        }}
      />
      <Stack.Screen
        name="HomeWalletList"
        component={HomeWalletListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TopTabsWalletDetail"
        component={TopTabsNavigator}
        options={{
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          headerTitle: () => {
            return <WalletSwitcherButton />;
          },
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
