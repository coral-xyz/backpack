import type { Blockchain, Nft } from "@coral-xyz/common";
import type { Token } from "~types/types";

import { useCallback } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import {
  IconCloseModal,
  TabIconBalances,
  TabIconApps,
  TabIconNfts,
  TabIconMessages,
} from "~components/Icon";
import { Avatar } from "~components/index";
// import { NavHeader } from "~components/NavHeader";
import { useTheme } from "~hooks/useTheme";
import { AccountSettingsNavigator } from "~navigation/AccountSettingsNavigator";
// import AppListScreen from "~screens/Unlocked/AppListScreen"; // TURNED off bc of app store restrictions (temporarily)
import { ChatNavigator } from "~navigation/ChatNavigator";
import { WalletsNavigator } from "~navigation/WalletsNavigator";
import { NotificationsScreen } from "~screens/NotificationsScreen";
import {
  DepositListScreen,
  DepositSingleScreen,
} from "~screens/Unlocked/DepositScreen";
import { SendCollectibleSendRecipientScreen } from "~screens/Unlocked/SendCollectibleSelectRecipientScreen";
import {
  SendTokenSelectRecipientScreen,
  SendTokenListScreen,
  SendTokenConfirmScreen,
} from "~screens/Unlocked/SendTokenScreen";
import { SwapTokenScreen } from "~screens/Unlocked/SwapTokenScreen";
import { WalletListScreen } from "~screens/Unlocked/WalletListScreen";
import { UtilsDesignScreen } from "~screens/Utils/UtilsDesignScreen";

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
  SendCollectibleSelectRecipient: {
    nft: Nft;
    to: {
      walletName?: string | undefined; // TBD
      address: string;
      username: string;
      image: string;
      uuid: string;
    };
  };
  // SendNFTConfirm: {
  //   nft: Nft;
  //   to: {
  //     walletName?: string | undefined; // TBD
  //     address: string;
  //     username: string;
  //     image: string;
  //     uuid: string;
  //   };
  // };
};

const ModalStack = createStackNavigator();
function SendModalStackNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <ModalStack.Navigator
      screenOptions={{
        headerTintColor: theme.custom.colors.fontColor,
        headerBackTitleVisible: false,
      }}
    >
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
    </ModalStack.Navigator>
  );
}

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
          options={{ title: "Deposit" }}
          name="DepositList"
          component={DepositListScreen}
        />
        <Stack.Screen
          options={{ title: "Deposit" }}
          name="DepositSingle"
          component={DepositSingleScreen}
        />
        <Stack.Group
          screenOptions={{ presentation: "modal", headerShown: false }}
        >
          <Stack.Screen
            name="SendSelectTokenModal"
            component={SendModalStackNavigator}
          />
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
  Wallets: undefined;
  Chat: undefined;
  AccountSettings: undefined;
  Notifications: undefined;
  Utils: undefined;
};

const TabIconNotifications = ({ size, fill }) => (
  <MaterialIcons name="notifications" size={size} color={fill} />
);

const TabIconUtils = ({ size, fill }) => (
  <MaterialIcons name="design-services" size={size} color={fill} />
);

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
      case "Notifications":
        return TabIconNotifications;
      case "AccountSettings":
        return Avatar;
      case "Utils":
        return TabIconUtils;
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
          return (
            <Component fill={color} width={size} height={size} size={size} />
          );
        },
        tabBarActiveTintColor: theme.custom.colors.brandColor,
        tabBarInactiveTintColor: theme.custom.colors.icon,
      })}
    >
      <Tab.Screen name="Wallets" component={WalletsNavigator} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true }}
      />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="AccountSettings" component={AccountSettingsNavigator} />
      <Tab.Screen name="Utils" component={UtilsDesignScreen} />
    </Tab.Navigator>
  );
}
