import { useCallback } from "react";

import { formatWalletAddress } from "@coral-xyz/common";
import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import {
  IconCloseModal,
  TabIconApps,
  // TabIconBalances,
  // TabIconMessages,
  TabIconNfts,
} from "~components/Icon";
import { Avatar } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { ChatNavigator } from "~navigation/ChatNavigator";
import { WalletsNavigator } from "~navigation/WalletsNavigator";
import {
  UnlockedNavigatorStackParamList,
  UnlockedTabNavigatorParamList,
} from "~navigation/types";
import { BrowserScreen } from "~screens/BrowserScreen";
import { ReceiveTokenScreen } from "~screens/ReceiveTokenScreen";
import { EditWalletDetailScreen } from "~screens/Unlocked/EditWalletDetailScreen";
import { SendCollectibleSendRecipientScreen } from "~screens/Unlocked/SendCollectibleSelectRecipientScreen";
import {
  SendTokenConfirmScreen,
  SendTokenSelectRecipientScreen,
} from "~screens/Unlocked/SendTokenScreen";
import { SwapTokenScreen } from "~screens/Unlocked/SwapTokenScreen";
import { WalletListScreen } from "~screens/Unlocked/WalletListScreen";
import { UtilsDesignScreen } from "~screens/Utils/UtilsDesignScreen";

import { TokenPriceNavigator } from "./TokenPriceNavigator";

import { SendNavigator } from "~src/navigation/SendNavigator";

const Stack = createStackNavigator<UnlockedNavigatorStackParamList>();
export function UnlockedNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="Tabs" component={UnlockedBottomTabNavigator} />
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
          name="DepositSingle"
          component={ReceiveTokenScreen}
        />
        <Stack.Group
          screenOptions={{ presentation: "modal", headerShown: false }}
        >
          <Stack.Screen name="SendSelectTokenModal" component={SendNavigator} />
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
      <Stack.Screen
        name="edit-wallets-wallet-detail"
        component={EditWalletDetailScreen}
        options={({ route }) => {
          const { name, publicKey } = route.params;
          return {
            title: `${name} (${formatWalletAddress(publicKey)})`,
          };
        }}
      />
    </Stack.Navigator>
  );
}

const TabIconBalances = ({ size, fill }) => (
  <MaterialIcons name="account-balance-wallet" size={size} color={fill} />
);

const TabIconPrices = ({ size, fill }) => (
  <MaterialIcons name="stacked-line-chart" size={size} color={fill} />
);

const TabIconMessages = ({ size, fill }) => (
  <MaterialIcons name="mark-chat-unread" size={size} color={fill} />
);

const TabIconNotifications = ({ size, fill }) => (
  <MaterialIcons name="notifications" size={size} color={fill} />
);

const TabIconUtils = ({ size, fill }) => (
  <MaterialIcons name="design-services" size={size} color={fill} />
);

const TabIconBrowser = ({ size, fill }) => (
  <MaterialIcons name="open-in-browser" size={size} color={fill} />
);

const Tab = createBottomTabNavigator<UnlockedTabNavigatorParamList>();
function UnlockedBottomTabNavigator(): JSX.Element {
  const theme = useTheme();
  const getIcon = useCallback((routeName: string) => {
    switch (routeName) {
      case "Balances":
        return TabIconBalances;
      case "TokenPrices":
        return TabIconPrices;
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
      case "Browser":
        return TabIconBrowser;
      default:
        return TabIconBalances;
    }
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
      <Tab.Screen
        name="Wallets"
        component={WalletsNavigator}
        options={{ title: "Wallets" }}
      />
      <Tab.Screen name="TokenPrices" component={TokenPriceNavigator} />
      <Tab.Screen
        name="Chat"
        component={ChatNavigator}
        options={{ title: "Chats" }}
      />
      <Tab.Screen name="Browser" component={BrowserScreen} />
      <Tab.Screen name="Utils" component={UtilsDesignScreen} />
    </Tab.Navigator>
  );
}
