import { type Blockchain } from "@coral-xyz/common";
import type {
  CollectibleGroup,
  ParseTransactionDetails,
  ResponseCollectible,
  ResponseTransaction,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { useTheme } from "@coral-xyz/tamagui";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";

import { CollectibleOptionsButton } from "../../components/Unlocked/Collectibles/Options";
import { ActivityDetailScreen } from "../screens/Unlocked/Activity/ActivityDetailScreen";
import { CollectiblesCollectionScreen } from "../screens/Unlocked/Collectibles/CollectiblesCollectionScreen";
import { CollectiblesDetailScreen } from "../screens/Unlocked/Collectibles/CollectiblesDetailScreen";
import { SearchScreen } from "../screens/Unlocked/Search/SearchScreen";
import { XnftScreen } from "../screens/Unlocked/Search/XnftScreen";
import { TokensDetailScreen } from "../screens/Unlocked/Tokens/TokensDetailScreen";
import { TokensDisplayManagementScreen } from "../screens/Unlocked/Tokens/TokensDisplayManagementScreen";

import type { Routes as ReceiveRoutes } from "./ReceiveNavigator";
import { ReceiveNavigator } from "./ReceiveNavigator";
import type { Routes as SendCollectibleRoutes } from "./SendCollectibleNavigator";
import { SendCollectibleNavigator } from "./SendCollectibleNavigator";
import type { Routes as SendRoutes } from "./SendNavigator";
import { SendNavigator } from "./SendNavigator";
import type { Routes as SettingsRoutes } from "./SettingsNavigator";
import { SettingsNavigator } from "./SettingsNavigator";
import type { Routes as StakeRoutes } from "./StakeNavigator";
import { StakeNavigator } from "./StakeNavigator";
import type { Routes as SwapRoutes } from "./SwapNavigator";
import { SwapNavigator } from "./SwapNavigator";
import type { Routes as TabsRoutes } from "./TabsNavigator";
import { TabsNavigator } from "./TabsNavigator";
import type { Routes as TensorRoutes } from "./TensorNavigator";
import { TensorNavigator } from "./TensorNavigator";
import {
  headerStyles,
  maybeCloseButton,
  NavButtonContainer,
  rootNavHeaderOptions,
} from "./utils";

export enum Routes {
  TabsNavigator = "TabsNavigator",
  TokensDetailScreen = "TokensDetailScreen",
  TokensDisplayManagementScreen = "TokensDisplayManagementScreen",
  ReceiveNavigator = "ReceiveNavigator",
  SendNavigator = "SendNavigator",
  TensorNavigator = "TensorNavigator",
  SendCollectibleNavigator = "SendCollectibleNavigator",
  SwapNavigator = "SwapNavigator",
  CollectiblesCollectionScreen = "CollectiblesCollectionScreen",
  CollectiblesDetailScreen = "CollectiblesDetailScreen",
  ActivityDetailScreen = "ActivityDetailScreen",
  StakeNavigator = "StakeNavigator",
  SettingsNavigator = "SettingsNavigator",
  XnftScreen = "XnftScreen",
  SearchScreen = "SearchScreen",
}

type WalletsScreenStackNavigatorParamList = {
  [Routes.TabsNavigator]: {
    screen: TabsRoutes;
    params: undefined;
  };
  [Routes.TokensDetailScreen]: {
    id: string;
    displayAmount: string;
    symbol: string;
    token: string;
    tokenAddress: string;
  };
  [Routes.TokensDisplayManagementScreen]: undefined;
  [Routes.CollectiblesCollectionScreen]: {
    title: string;
    data: CollectibleGroup[];
  };
  [Routes.CollectiblesDetailScreen]: {
    title: string;
    data: ResponseCollectible;
  };
  [Routes.ActivityDetailScreen]: {
    transaction: ResponseTransaction;
  };
  [Routes.SendNavigator]: {
    screen: SendRoutes;
    params?: { assetId: string; blockchain: Blockchain };
  };
  [Routes.TensorNavigator]: {
    screen: TensorRoutes;
    params: {
      title: string;
      data: ResponseCollectible;
    };
  };
  [Routes.SendCollectibleNavigator]: {
    screen: SendCollectibleRoutes;
    params: {
      nftId: string;
    };
  };
  [Routes.ReceiveNavigator]: {
    screen: ReceiveRoutes;
    params: undefined;
  };
  [Routes.SwapNavigator]: {
    screen: SwapRoutes;
    params?: {
      assetId: string;
    };
  };
  [Routes.StakeNavigator]: {
    screen: StakeRoutes;
    params: undefined;
  };
  [Routes.SettingsNavigator]: {
    screen: SettingsRoutes;
    params: undefined;
  };
  [Routes.XnftScreen]: {
    xnftAddress: string;
    fullXnftPath: string;
  };
  [Routes.SearchScreen]: undefined;
};

export type TabsNavigatorProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.TabsNavigator
>;

export type TokensDetailScreenProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.TokensDetailScreen
>;

export type TokensDisplayManagementScreenProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.TokensDisplayManagementScreen
>;

export type CollectiblesDetailScreenProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.CollectiblesDetailScreen
>;

export type CollectiblesCollectionScreenProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.CollectiblesCollectionScreen
>;

export type ActivityDetailScreenProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.ActivityDetailScreen
>;

export type ReceiveNavigatorProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.ReceiveNavigator
>;

export type SendNavigatorProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.SendNavigator
>;

export type TensorNavigatorProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.TensorNavigator
>;

export type SendCollectibleNavigatorProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.SendCollectibleNavigator
>;

export type SwapNavigatorProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.SwapNavigator
>;

export type StakeNavigatorProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.StakeNavigator
>;

export type SettingsNavigatorProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.SettingsNavigator
>;

export type XnftScreenProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.XnftScreen
>;

export type SearchScreenProps = StackScreenProps<
  WalletsScreenStackNavigatorParamList,
  Routes.SearchScreen
>;

const Stack = createStackNavigator<WalletsScreenStackNavigatorParamList>();

export function WalletsNavigator() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName={Routes.TabsNavigator}
      screenOptions={({ navigation: _ }) => {
        return {
          ...(headerStyles as any),
        };
      }}
    >
      <Stack.Screen
        name={Routes.TabsNavigator}
        component={TabsNavigator}
        options={({ navigation }) => {
          return {
            ...rootNavHeaderOptions({ navigation }),
          };
        }}
      />
      <Stack.Screen
        name={Routes.TokensDetailScreen}
        component={TokensDetailScreen}
        options={({
          navigation,
          route: {
            params: { symbol },
          },
        }) => {
          return {
            title: symbol,
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.CollectiblesDetailScreen}
        component={CollectiblesDetailScreen}
        options={({
          navigation,
          route: {
            params: { title, data },
          },
        }) => {
          return {
            title,
            ...maybeCloseButton(false, navigation),
            headerRight: (_props: any) => (
              <NavButtonContainer>
                <CollectibleOptionsButton nft={data} />
              </NavButtonContainer>
            ),
          };
        }}
      />
      <Stack.Screen
        name={Routes.CollectiblesCollectionScreen}
        component={CollectiblesCollectionScreen}
        options={({
          navigation,
          route: {
            params: { title },
          },
        }) => {
          return {
            title,
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.ActivityDetailScreen}
        component={ActivityDetailScreen}
        options={({ navigation }) => {
          return {
            title: t("activity"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Group
        screenOptions={{
          presentation: "modal",
          headerShown: false,
          cardStyleInterpolator: undefined,
        }}
      >
        <Stack.Screen name={Routes.SendNavigator} component={SendNavigator} />
        <Stack.Screen
          name={Routes.TensorNavigator}
          component={TensorNavigator}
        />
        <Stack.Screen
          name={Routes.SendCollectibleNavigator}
          component={SendCollectibleNavigator}
        />
        <Stack.Screen
          name={Routes.ReceiveNavigator}
          component={ReceiveNavigator}
        />
        <Stack.Screen name={Routes.SwapNavigator} component={SwapNavigator} />
        <Stack.Screen name={Routes.StakeNavigator} component={StakeNavigator} />
        <Stack.Screen
          name={Routes.SettingsNavigator}
          component={SettingsNavigator}
        />
        <Stack.Screen
          name={Routes.XnftScreen}
          component={XnftScreen}
          options={({ navigation: _ }) => {
            return {
              title: "xNFT",
            };
          }}
        />
        <Stack.Screen
          name={Routes.TokensDisplayManagementScreen}
          component={TokensDisplayManagementScreen}
          options={({ navigation }) => {
            return {
              title: t("hidden_tokens"),
              headerShown: true,
              ...maybeCloseButton(true, navigation),
            };
          }}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: "transparentModal",
          cardStyleInterpolator: undefined,
        }}
      >
        <Stack.Screen
          name={Routes.SearchScreen}
          component={SearchScreen}
          options={({ navigation }) => {
            return {
              title: t("search"),
              ...maybeCloseButton(true, navigation),
            };
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
