import { type Blockchain } from "@coral-xyz/common";
import type { ResponseCollectible } from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import type { TensorActions } from "@coral-xyz/secure-clients/types";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";

import { TensorCollectibleActionScreen } from "../screens/Unlocked/Tensor/TensorCollectibleActionScreen";
import { TensorCollectibleListScreen } from "../screens/Unlocked/Tensor/TensorCollectibleListScreen";

import { headerStyles, maybeCloseButton } from "./utils";
import type { TensorNavigatorProps } from "./WalletsNavigator";

export enum Routes {
  TensorCollectibleListScreen = "TensorCollectibleListScreen",
  TensorCollectibleActionScreen = "TensorCollectibleActionScreen",
}

type TensorScreenStackNavigatorParamList = {
  [Routes.TensorCollectibleListScreen]: {
    ctx: {
      publicKey: string;
      blockchain: Blockchain;
    };
    nft: ResponseCollectible;
    price?: string;
    edit?: boolean;
  };
  [Routes.TensorCollectibleActionScreen]: {
    ctx: {
      publicKey: string;
      blockchain: Blockchain;
    };
    progressId: string;
    action: TensorActions;
    description: string;
    nft: ResponseCollectible;
    mint: string;
    price: string;
  };
};

export type TensorCollectibleListScreenProps = StackScreenProps<
  TensorScreenStackNavigatorParamList,
  Routes.TensorCollectibleListScreen
>;
export type TensorCollectibleActionScreenProps = StackScreenProps<
  TensorScreenStackNavigatorParamList,
  Routes.TensorCollectibleActionScreen
>;

const Stack = createStackNavigator<TensorScreenStackNavigatorParamList>();

export function TensorNavigator({
  route: {
    params: { screen },
  },
}: TensorNavigatorProps) {
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
        name={Routes.TensorCollectibleListScreen}
        component={TensorCollectibleListScreen}
        options={({ navigation }) => {
          return {
            title: t("tensor_marketplace"),
            ...maybeCloseButton(false, navigation),
          };
        }}
      />
      <Stack.Screen
        name={Routes.TensorCollectibleActionScreen}
        component={TensorCollectibleActionScreen}
        options={() => {
          return {
            title: t("tensor_marketplace"),
          };
        }}
      />
    </Stack.Navigator>
  );
}
