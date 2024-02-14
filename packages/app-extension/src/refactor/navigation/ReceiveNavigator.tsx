import { useTranslation } from "@coral-xyz/i18n";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";

import { ReceiveScreen } from "../screens/Unlocked/Receive/ReceiveScreen";

import { headerStyles, maybeCloseButton } from "./utils";
import type { ReceiveNavigatorProps } from "./WalletsNavigator";

export enum Routes {
  ReceiveScreen = "ReceiveScreen",
}

type ReceiveScreenStackNavigatorParamList = {
  [Routes.ReceiveScreen]: undefined;
};

export type ReceiveScreenProps = StackScreenProps<
  ReceiveScreenStackNavigatorParamList,
  Routes.ReceiveScreen
>;

const Stack = createStackNavigator<ReceiveScreenStackNavigatorParamList>();

export function ReceiveNavigator(_props: ReceiveNavigatorProps) {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName={Routes.ReceiveScreen}
      screenOptions={({ navigation: _ }) => {
        return {
          ...(headerStyles as any),
        };
      }}
    >
      <Stack.Screen
        name={Routes.ReceiveScreen}
        component={ReceiveScreen}
        options={({ navigation }) => {
          return {
            title: t("deposit"),
            ...maybeCloseButton(true, navigation, "go-back"),
          };
        }}
      />
    </Stack.Navigator>
  );
}
