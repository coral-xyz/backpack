import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";

import { SendCollectibleAddressSelectScreen } from "../screens/Unlocked/SendCollectible/SendCollectibleAddressSelectScreen";
import { SendCollectibleConfirmationScreen } from "../screens/Unlocked/SendCollectible/SendCollectibleConfirmationScreen";

import { headerStyles, maybeCloseButton } from "./utils";
import type { SendCollectibleNavigatorProps } from "./WalletsNavigator";

export enum Routes {
  SendCollectibleAddressSelectScreen = "SendCollectibleAddressSelectScreen",
  SendCollectibleConfirmationScreen = "SendCollectibleConfirmationScreen",
}

type SendCollectibleScreenStackNavigatorParamList = {
  [Routes.SendCollectibleAddressSelectScreen]: {
    nftId: string;
  };
  [Routes.SendCollectibleConfirmationScreen]: {
    image?: string;
    name?: string;
    nftId: string;
    signature: string;
  };
};

export type SendCollectibleAddressSelectScreenProps = StackScreenProps<
  SendCollectibleScreenStackNavigatorParamList,
  Routes.SendCollectibleAddressSelectScreen
>;

export type SendCollectibleConfirmationScreenProps = StackScreenProps<
  SendCollectibleScreenStackNavigatorParamList,
  Routes.SendCollectibleConfirmationScreen
>;

const Stack =
  createStackNavigator<SendCollectibleScreenStackNavigatorParamList>();

export function SendCollectibleNavigator({
  route: {
    params: {
      params: { nftId },
    },
  },
}: SendCollectibleNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName={Routes.SendCollectibleAddressSelectScreen}
      screenOptions={({ navigation: _ }) => {
        return {
          ...(headerStyles as any),
        };
      }}
    >
      <Stack.Screen
        name={Routes.SendCollectibleAddressSelectScreen}
        // @ts-ignore: todo: update this hack once we actually embed this navigator in a parent naviagator.
        component={(props: SendCollectibleAddressSelectScreenProps) => (
          <SendCollectibleAddressSelectScreen
            {...props}
            // @ts-ignore
            route={{ params: { nftId } }}
          />
        )}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(true, navigation, "go-back"),
          };
        }}
      />
      <Stack.Screen
        name={Routes.SendCollectibleConfirmationScreen}
        component={SendCollectibleConfirmationScreen}
        options={({ navigation }) => {
          return {
            title: "",
            ...maybeCloseButton(true, navigation, "pop-root-twice"),
          };
        }}
      />
    </Stack.Navigator>
  );
}
