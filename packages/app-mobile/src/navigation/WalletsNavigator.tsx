import { View } from "react-native";

import { Blockchain, toTitleCase } from "@coral-xyz/common";
import { SwapProvider } from "@coral-xyz/recoil";
import { useTheme as useTamaguiTheme } from "@coral-xyz/tamagui";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createStackNavigator,
  StackScreenProps,
} from "@react-navigation/stack";

import { BottomSheetViewOptions } from "~components/BottomSheetViewOptions";
import { IconCloseModal } from "~components/Icon";
import { WalletSwitcherButton } from "~components/WalletSwitcherButton";
import { useTheme } from "~hooks/useTheme";
import { WINDOW_WIDTH } from "~lib/index";
import {
  HeaderAvatarButton,
  HeaderButton,
  HeaderButtonSpacer,
} from "~navigation/components";
import { TopTabsParamList } from "~navigation/types";
import { CollectionDetailScreen } from "~screens/CollectionDetailScreen";
import { CollectionItemDetailScreen } from "~screens/CollectionItemDetailScreen";
import { CollectionListScreen } from "~screens/CollectionListScreen";
import { HomeWalletListScreen } from "~screens/HomeWalletListScreen";
import { NotificationsScreen } from "~screens/NotificationsScreen";
import { ReceiveTokenScreen } from "~screens/ReceiveTokenScreen";
import { RecentActivityScreen } from "~screens/RecentActivityScreen";
import { TokenDetailScreen } from "~screens/TokenDetailScreen";
import { TokenListScreen } from "~screens/TokenListScreen";
import { SendCollectibleSendRecipientScreen } from "~screens/Unlocked/SendCollectibleSelectRecipientScreen";

import { SendNavigator } from "~src/navigation/SendNavigator";
import {
  Direction,
  SwapTokenScreen,
  SwapTokenConfirmScreen,
  SwapTokenListScreen,
} from "~src/screens/Unlocked/SwapTokenScreen";

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
  SwapModal: undefined;
  DepositSingle: undefined;
  SendSelectTokenModal: undefined;
  SendCollectibleSelectRecipient: {
    nft: {
      name: string;
    };
  };
};

export type HomeWalletListScreenProps = StackScreenProps<
  WalletStackParamList,
  "HomeWalletList"
>;

export type TokenDetailScreenProps = StackScreenProps<
  WalletStackParamList,
  "TokenDetail"
>;

export type CollectionItemDetailScreenProps = StackScreenProps<
  WalletStackParamList,
  "CollectionItemDetail"
>;

const Stack = createStackNavigator<WalletStackParamList>();
export function WalletsNavigator(): JSX.Element {
  const theme = useTamaguiTheme();
  return (
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
              <HeaderButtonSpacer>
                <HeaderAvatarButton {...props} navigation={navigation} />
              </HeaderButtonSpacer>
            ),
            headerRight: (props) => (
              <HeaderButtonSpacer>
                <HeaderButton
                  name="notifications"
                  {...props}
                  onPress={() => {
                    navigation.navigate("Notifications");
                  }}
                />
              </HeaderButtonSpacer>
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
        options={({ route, navigation }) => {
          return {
            headerBackTitleVisible: false,
            title: route.params.title,
          };
        }}
      />
      <Stack.Group
        screenOptions={{
          presentation: "modal",
          headerShown: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.fontColor.val,
          headerBackImage: IconCloseModal,
        }}
      >
        <Stack.Screen
          options={{ title: "Deposit" }}
          name="DepositSingle"
          component={ReceiveTokenScreen}
        />
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SendSelectTokenModal" component={SendNavigator} />
          <Stack.Screen name="SwapModal" component={SwapNavigator} />
        </Stack.Group>
        <Stack.Screen
          name="SendCollectibleSelectRecipient"
          component={SendCollectibleSendRecipientScreen}
          options={({ route }) => {
            const { nft } = route.params;
            return {
              title: `Send ${nft.name}`,
            };
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

type SwapStackParamList = {
  SwapToken: {
    title?: string;
    address: string;
    blockchain: Blockchain;
  };
  SwapTokenList: {
    direction: Direction;
  };
  SwapTokenConfirm: {
    title?: string;
    address: string;
    blockchain: Blockchain;
  };
};

const SwapStack = createNativeStackNavigator<SwapStackParamList>();
function SwapNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <View style={{ paddingBottom: 48 }}>
      <SwapProvider>
        <SwapStack.Navigator
          screenOptions={{
            headerShown: true,
            headerTintColor: theme.custom.colors.fontColor,
            headerBackTitleVisible: false,
          }}
        >
          <SwapStack.Screen
            name="SwapToken"
            component={SwapTokenScreen}
            options={{ title: "Swap Token" }}
          />
          <SwapStack.Screen
            name="SwapTokenConfirm"
            component={SwapTokenConfirmScreen}
            options={{ title: "Review Order" }}
          />
          <SwapStack.Screen
            name="SwapTokenList"
            component={SwapTokenListScreen}
            options={({ route }) => {
              const title =
                route.params.direction === Direction.From ? "From" : "To";
              return {
                title: `Select ${title}`,
              };
            }}
          />
        </SwapStack.Navigator>
      </SwapProvider>
    </View>
  );
}
