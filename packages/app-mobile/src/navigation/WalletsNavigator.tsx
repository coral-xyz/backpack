import { View } from "react-native";

import Constants from "expo-constants";

import { Blockchain, toTitleCase } from "@coral-xyz/common";
import { useTheme as useTamaguiTheme } from "@coral-xyz/tamagui";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StackScreenProps } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheetViewOptions } from "~components/BottomSheetViewOptions";
import { WalletSwitcherButton } from "~components/WalletSwitcherButton";
import { useTheme } from "~hooks/useTheme";
import { WINDOW_WIDTH } from "~lib/index";
import { HeaderAvatarButton, HeaderButton } from "~navigation/components";
import { TopTabsParamList } from "~navigation/types";
import { CollectionDetailScreen } from "~screens/CollectionDetailScreen";
import { CollectionItemDetailScreen } from "~screens/CollectionItemDetailScreen";
import { CollectionListScreen } from "~screens/CollectionListScreen";
import { HomeWalletListScreen } from "~screens/HomeWalletListScreen";
import { NotificationsScreen } from "~screens/NotificationsScreen";
import { RecentActivityScreen } from "~screens/RecentActivityScreen";
import { TokenDetailScreen } from "~screens/TokenDetailScreen";
import { TokenListScreen } from "~screens/TokenListScreen";

const TopTabs = createMaterialTopTabNavigator<TopTabsParamList>();
function TopTabsNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <TopTabs.Navigator
      initialLayout={{
        width: WINDOW_WIDTH,
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
  TokenDetail: {
    blockchain: Blockchain;
    tokenTicker: string;
  };
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
  Notifications: undefined;
};

export type HomeWalletListScreenProps = StackScreenProps<
  WalletStackParamList,
  "HomeWalletList"
>;

export type TokenDetailScreenParams = StackScreenProps<
  WalletStackParamList,
  "TokenDetail"
>;

const Stack = createNativeStackNavigator<WalletStackParamList>();
export function WalletsNavigator(): JSX.Element {
  const tabBarEnabled = Constants.expoConfig?.extra?.tabBarEnabled;
  const insets = useSafeAreaInsets();
  const theme = useTamaguiTheme();
  return (
    <View
      style={{
        flex: 1,
        marginBottom: !tabBarEnabled ? insets.bottom : 0,
      }}
    >
      <Stack.Navigator
        initialRouteName="HomeWalletList"
        screenOptions={{
          headerTintColor: theme.fontColor.val,
        }}
      >
        <Stack.Screen
          name="HomeWalletList"
          component={HomeWalletListScreen}
          options={({ navigation }) => {
            return {
              headerShown: true,
              headerBackTitleVisible: false,
              title: "Balances",
              headerTitle: ({ tintColor, children }) => {
                return (
                  <BottomSheetViewOptions
                    tintColor={tintColor}
                    title={children}
                    navigation={navigation}
                  />
                );
              },
              headerLeft: (props) => (
                <HeaderAvatarButton {...props} navigation={navigation} />
              ),
              headerRight: (props) => (
                <HeaderButton
                  name="notifications"
                  {...props}
                  onPress={() => {
                    navigation.navigate("Notifications");
                  }}
                />
              ),
            };
          }}
        />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
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
          options={({ route }) => {
            const { blockchain, tokenTicker } = route.params;
            const title = `${toTitleCase(blockchain)} / ${tokenTicker}`;
            return {
              title,
            };
          }}
        />
        <Stack.Screen
          name="CollectionDetail"
          component={CollectionDetailScreen}
          options={({ route }) => {
            return {
              headerBackTitleVisible: false,
              title: route.params.title,
            };
          }}
        />
        <Stack.Screen
          name="CollectionItemDetail"
          component={CollectionItemDetailScreen}
          options={({ route }) => {
            return {
              headerBackTitleVisible: false,
              title: route.params.title,
            };
          }}
        />
      </Stack.Navigator>
    </View>
  );
}
