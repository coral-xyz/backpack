import { type Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";

import { SendAddressSelectScreen } from "../screens/Unlocked/Send/SendAddressSelectScreen";
import { SendAmountSelectScreen } from "../screens/Unlocked/Send/SendAmountSelectScreen";
import { SendConfirmationScreen } from "../screens/Unlocked/Send/SendConfirmationScreen";
import { SendTokenSelectScreen } from "../screens/Unlocked/Send/SendTokenSelectScreen";

import { headerStyles, maybeCloseButton } from "./utils";
import type { SendNavigatorProps } from "./WalletsNavigator";

export enum Routes {
  SendTokenSelectScreen = "SendTokenSelectScreen",
  SendAddressSelectScreen = "SendAddressSelectScreen",
  SendAmountSelectScreen = "SendAmountSelectScreen",
  SendConfirmationScreen = "SendConfirmationScreen",
}

type SendScreenStackNavigatorParamList = {
  [Routes.SendTokenSelectScreen]: undefined;
  [Routes.SendAddressSelectScreen]: {
    blockchain: Blockchain;
    assetId: string;
  };
  [Routes.SendAmountSelectScreen]: {
    assetId: string;
    blockchain: Blockchain;
    to: {
      address: string;
      username?: string;
      walletName?: string;
      image?: string;
      uuid?: string;
    };
  };
  [Routes.SendConfirmationScreen]: {
    amount: string;
    signature: string;
    tokenId: string;
  };
};

export type SendTokenSelectScreenProps = StackScreenProps<
  SendScreenStackNavigatorParamList,
  Routes.SendTokenSelectScreen
>;

export type SendAddressSelectScreenProps = StackScreenProps<
  SendScreenStackNavigatorParamList,
  Routes.SendAddressSelectScreen
>;

export type SendAmountSelectScreenProps = StackScreenProps<
  SendScreenStackNavigatorParamList,
  Routes.SendAmountSelectScreen
>;

export type SendConfirmationScreenProps = StackScreenProps<
  SendScreenStackNavigatorParamList,
  Routes.SendConfirmationScreen
>;

const Stack = createStackNavigator<SendScreenStackNavigatorParamList>();

export function SendNavigator({
  route: {
    params: { screen },
  },
}: SendNavigatorProps) {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName={screen}
      screenOptions={({ navigation: _ }) => {
        return {
          ...(headerStyles as any),
        };
      }}
    >
      <Stack.Screen
        name={Routes.SendTokenSelectScreen}
        component={SendTokenSelectScreen}
        options={({ navigation }) => {
          return {
            title: t("select_token"),
            ...maybeCloseButton(
              screen === Routes.SendTokenSelectScreen,
              navigation,
              "go-back"
            ),
          };
        }}
      />
      <Stack.Screen
        name={Routes.SendAddressSelectScreen}
        component={SendAddressSelectScreen}
        options={({ navigation }) => {
          return {
            title: t("send"),
            ...maybeCloseButton(
              screen === Routes.SendAddressSelectScreen,
              navigation,
              screen === Routes.SendAddressSelectScreen
                ? "go-back"
                : "pop-root-twice"
            ),
          };
        }}
      />
      <Stack.Screen
        name={Routes.SendAmountSelectScreen}
        component={SendAmountSelectScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(
              screen === Routes.SendAmountSelectScreen,
              navigation,
              "pop-root-twice"
            ),
          };
        }}
      />
      <Stack.Screen
        name={Routes.SendConfirmationScreen}
        component={SendConfirmationScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(false, navigation, "pop-root-twice"),
          };
        }}
      />
    </Stack.Navigator>
  );
}
