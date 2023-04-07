import type { Token } from "@@types/types";
import type { Blockchain, Nft } from "@coral-xyz/common";

import { useCallback } from "react";

import Constants from "expo-constants";

import { parseNftName } from "@coral-xyz/common";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { getHeaderTitle } from "@react-navigation/elements";
import { createStackNavigator } from "@react-navigation/stack";

import {
  IconCloseModal,
  TabIconBalances,
  TabIconApps,
  TabIconNfts,
  TabIconMessages,
} from "~components/Icon";
// import { NavHeader } from "~components/NavHeader";
import { useTheme } from "~hooks/useTheme";
import { AccountSettingsNavigator } from "~navigation/AccountSettingsNavigator";
// import AppListScreen from "~screens/Unlocked/AppListScreen"; // TURNED off bc of app store restrictions (temporarily)
import { ChatNavigator } from "~navigation/ChatNavigator";
import { BalancesNavigator } from "~screens/Unlocked/BalancesScreen";
import {
  DepositListScreen,
  DepositSingleScreen,
} from "~screens/Unlocked/DepositScreen";
import { NftCollectiblesNavigator } from "~screens/Unlocked/NftCollectiblesScreen";
import { RecentActivityScreen } from "~screens/Unlocked/RecentActivityScreen";
import {
  SendTokenSelectRecipientScreen,
  SendTokenListScreen,
  SendTokenConfirmScreen,
  SendNFTConfirmScreen,
} from "~screens/Unlocked/SendTokenScreen";
import { SwapTokenScreen } from "~screens/Unlocked/SwapTokenScreen";
import { WalletListScreen } from "~screens/Unlocked/WalletListScreen";

export type UnlockedNavigatorStackParamList = {
  Tabs: undefined;
  AccountSettings: undefined;
  RecentActivity: undefined;
  DepositList: undefined;
  DepositSingle: undefined;
  SendSelectTokenModal: undefined;
  "wallet-picker": undefined;
  SendTokenModal: {
    title: string;
    blockchain: Blockchain;
    token: Token;
  };
  SwapModal: undefined;
  SendTokenConfirm: {
    blockchain: Blockchain;
    token: Token;
    to: {
      walletName?: string | undefined; // TBD
      address: string;
      username: string;
      image: string;
      uuid: string;
    };
  };
  SendNFTConfirm: {
    nft: Nft;
    to: {
      walletName?: string | undefined; // TBD
      address: string;
      username: string;
      image: string;
      uuid: string;
    };
  };
};

const Stack = createStackNavigator<UnlockedNavigatorStackParamList>();
export function UnlockedNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="Tabs" component={UnlockedBottomTabNavigator} />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsNavigator}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: "modal",
          headerShown: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.custom.colors.fontColor,
          headerBackImage: IconCloseModal,
        }}
      >
        <Stack.Screen
          name="RecentActivity"
          component={RecentActivityScreen}
          options={{ title: "Recent Activity" }}
        />
        <Stack.Screen
          options={{ title: "Deposit" }}
          name="DepositList"
          component={DepositListScreen}
        />
        <Stack.Screen
          options={{ title: "Deposit" }}
          name="DepositSingle"
          component={DepositSingleScreen}
        />
        <Stack.Screen
          options={{ title: "Select Token" }}
          name="SendSelectTokenModal"
          component={SendTokenListScreen}
        />
        <Stack.Screen
          name="SendTokenModal"
          component={SendTokenSelectRecipientScreen}
          options={({ route }) => {
            const { token } = route.params;
            return {
              title: `Send ${token.ticker}`,
            };
          }}
        />
        <Stack.Screen
          name="SendTokenConfirm"
          component={SendTokenConfirmScreen}
          options={({ route }) => {
            const { token } = route.params;
            return {
              title: `Send ${token.ticker}`,
            };
          }}
        />
        <Stack.Screen
          name="SendNFTConfirm"
          component={SendNFTConfirmScreen}
          options={({ route }) => {
            const { nft } = route.params;
            return {
              title: parseNftName(nft),
            };
          }}
        />
        <Stack.Screen
          options={{ title: "Swap" }}
          name="SwapModal"
          component={SwapTokenScreen}
        />
        <Stack.Screen
          options={{ title: "Wallets" }}
          name="wallet-picker"
          component={WalletListScreen}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

type UnlockedTabNavigatorParamList = {
  Balances: undefined;
  Applications: undefined;
  Collectibles: undefined;
  Chat: undefined;
};

const Tab = createBottomTabNavigator<UnlockedTabNavigatorParamList>();
function UnlockedBottomTabNavigator(): JSX.Element {
  const theme = useTheme();
  const getIcon = useCallback((routeName: string) => {
    switch (routeName) {
      case "Balances":
        return TabIconBalances;
      case "Applications":
        return TabIconApps;
      case "Collectibles":
        return TabIconNfts;
      case "Chat":
        return TabIconMessages;
      default:
        return TabIconBalances;
    }
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const Component = getIcon(route.name);
          return <Component fill={color} width={size} height={size} />;
        },
        tabBarActiveTintColor: theme.custom.colors.brandColor,
        tabBarInactiveTintColor: theme.custom.colors.icon,
      })}
    >
      <Tab.Screen name="Balances" component={BalancesNavigator} />
      <Tab.Screen name="Collectibles" component={NftCollectiblesNavigator} />
      {Constants.expoConfig.extra.FEATURE_MOBILE_CHAT ? (
        <Tab.Screen name="Chat" component={ChatNavigator} />
      ) : null}
    </Tab.Navigator>
  );
}
