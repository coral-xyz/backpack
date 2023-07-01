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
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

import { OnboardingNavigator } from "~src/navigation/OnboardingNavigator";
import { SendNavigator } from "~src/navigation/SendNavigator";
import { RecentActivityDetailScreen } from "~src/screens/RecentActivityDetailScreen";
import {
  Direction,
  SwapTokenScreen,
  SwapTokenConfirmScreen,
  SwapTokenListScreen,
} from "~src/screens/Unlocked/SwapTokenScreen";

function OnboardScreen() {
  return <OnboardingNavigator onStart={console.log} />;
}

const TopTabs = createMaterialTopTabNavigator<TopTabsParamList>();
function TopTabsNavigator(): JSX.Element {
  return (
    <TopTabs.Navigator
      initialLayout={{
        width: WINDOW_WIDTH,
      }}
      screenOptions={{
        tabBarStyle: {
          marginTop: 12,
          marginHorizontal: 12,
          backgroundColor: "transparent",
        },
        tabBarLabelStyle: {
          textTransform: "capitalize",
          fontSize: 16,
          fontFamily: "InterMedium",
        },
        tabBarIndicatorStyle: {
          borderRadius: 12,
          backgroundColor: "rgba(0, 87, 235, 0.15)",
          alignSelf: "center",
          height: 40,
          marginBottom: 4,
        },
        tabBarActiveTintColor: "#0057EB",
        tabBarInactiveTintColor: "#5D606F",
        tabBarPressOpacity: 0.2,
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
    title: string;
    tokenMint: string;
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
  RecentActivityDetail: {
    id: string;
    title: string;
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

export type RecentActivityDetailScreenProps = StackScreenProps<
  WalletStackParamList,
  "RecentActivityDetail"
>;

const Stack = createStackNavigator<WalletStackParamList>();
export function WalletsNavigator(): JSX.Element {
  const theme = useTamaguiTheme();
  return (
    <Stack.Navigator
      initialRouteName="HomeWalletList"
      screenOptions={{
        headerTintColor: theme.baseTextMedEmphasis.val,
        headerStyle: {
          backgroundColor: "transparent",
        },
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
            headerStyle: {
              backgroundColor: "transparent",
            },
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
                  {...props}
                  name="notifications-none"
                  tintColor={theme.icon.val}
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
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerTitle: () => {
            return <WalletSwitcherButton />;
          },
        }}
      />
      <Stack.Screen
        name="TokenDetail"
        component={TokenDetailScreen}
        options={({ route }) => {
          return {
            title: route.params.title,
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
      <Stack.Screen
        name="RecentActivityDetail"
        component={RecentActivityDetailScreen}
        options={{
          title: "Recent Activity",
        }}
      />
      <Stack.Screen name="OnboardScreen" component={OnboardScreen} />
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
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  return (
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
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
