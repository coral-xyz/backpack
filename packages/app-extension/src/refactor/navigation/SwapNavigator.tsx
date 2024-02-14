import { useTranslation } from "@coral-xyz/i18n";
import type { SwapQuoteResponse, SwapReceipt } from "@coral-xyz/recoil";
import { SwapProvider } from "@coral-xyz/recoil";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";

import { SwapConfirmationScreen } from "../screens/Unlocked/Swap/SwapConfirmationScreen";
import { SwapScreen } from "../screens/Unlocked/Swap/SwapScreen";
import { SwapTokenSelectScreen } from "../screens/Unlocked/Swap/SwapTokenSelectScreen";

import { headerStyles, maybeCloseButton } from "./utils";
import type { SwapNavigatorProps } from "./WalletsNavigator";

export enum Routes {
  SwapScreen = "SwapScreen",
  SwapTokenSelectScreen = "SwapTokenSelectScreen",
  SwapConfirmationScreen = "SwapConfirmationScreen",
}

export type SwapScreenStackNavigatorParamList = {
  [Routes.SwapScreen]: {
    assetId?: string;
  };
  [Routes.SwapTokenSelectScreen]: {
    isFromMint: boolean;
    input: boolean;
  };
  [Routes.SwapConfirmationScreen]: {
    receipt: SwapReceipt;
    quoteResponse: SwapQuoteResponse;
  };
};

export type SwapScreenProps = StackScreenProps<
  SwapScreenStackNavigatorParamList,
  Routes.SwapScreen
>;

export type SwapTokenSelectScreenProps = StackScreenProps<
  SwapScreenStackNavigatorParamList,
  Routes.SwapTokenSelectScreen
>;

export type SwapConfirmationScreenProps = StackScreenProps<
  SwapScreenStackNavigatorParamList,
  Routes.SwapConfirmationScreen
>;

const Stack = createStackNavigator<SwapScreenStackNavigatorParamList>();

export function SwapNavigator({
  route: {
    params: { params },
  },
}: SwapNavigatorProps) {
  const { t } = useTranslation();

  return (
    <SwapProvider defaultFromAssetId={params?.assetId}>
      <Stack.Navigator
        initialRouteName={Routes.SwapScreen}
        screenOptions={({ navigation: _ }) => {
          return {
            ...(headerStyles as any),
          };
        }}
      >
        <Stack.Screen
          name={Routes.SwapScreen}
          component={SwapScreen}
          options={({ navigation }) => {
            return {
              title: t("swap"),
              ...maybeCloseButton(true, navigation, "go-back"),
            };
          }}
        />
        <Stack.Screen
          name={Routes.SwapTokenSelectScreen}
          component={SwapTokenSelectScreen}
          options={({ navigation }) => {
            return {
              title: t("select_token"),
              ...maybeCloseButton(false, navigation),
            };
          }}
        />
        <Stack.Screen
          name={Routes.SwapConfirmationScreen}
          component={SwapConfirmationScreen}
          options={({ navigation }) => {
            return {
              title: t("confirming"),
              ...maybeCloseButton(false, navigation),
            };
          }}
        />
      </Stack.Navigator>
    </SwapProvider>
  );
}
