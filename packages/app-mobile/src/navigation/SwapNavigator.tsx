import type { Blockchain } from "@coral-xyz/common";

import { View } from "react-native";

import { SwapProvider } from "@coral-xyz/recoil";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "~src/hooks/useTheme";
import { HeaderCloseButton } from "~src/navigation/components";
import {
  Direction,
  SwapTokenScreen,
  SwapTokenConfirmScreen,
  SwapTokenListScreen,
} from "~src/screens/Unlocked/SwapTokenScreen";

type SwapStackParamList = {
  SwapTokenScreen: {
    title?: string;
    address: string;
    blockchain: Blockchain;
  };
  SwapTokenConfirmScreen: undefined;
  SwapTokenListScreen: {
    direction: Direction;
  };
};

export type SwapTokenScreenProps = NativeStackScreenProps<
  SwapStackParamList,
  "SwapTokenScreen"
>;
export type SwapTokenListScreenProps = NativeStackScreenProps<
  SwapStackParamList,
  "SwapTokenListScreen"
>;
export type SwapTokenConfirmScreenProps = NativeStackScreenProps<
  SwapStackParamList,
  "SwapTokenConfirmScreen"
>;

const SwapStack = createNativeStackNavigator<SwapStackParamList>();
export function SwapNavigator(): JSX.Element {
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
            // headerBackImageSource: require("~src/images/icons/arrow_back.png"),
          }}
        >
          <SwapStack.Screen
            name="SwapTokenScreen"
            component={SwapTokenScreen}
            options={({ navigation }) => {
              return {
                title: "Swap Token",
                headerLeft: (props) => {
                  return (
                    <HeaderCloseButton onPress={navigation.goBack} {...props} />
                  );
                },
              };
            }}
          />
          <SwapStack.Screen
            name="SwapTokenConfirmScreen"
            component={SwapTokenConfirmScreen}
            options={{ title: "Review Order" }}
          />
          <SwapStack.Screen
            name="SwapTokenListScreen"
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
