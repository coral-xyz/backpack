import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HeaderButton } from "~navigation/components";
import { TokenPriceStackParamList } from "~navigation/types";
import { TokenPriceBuyScreen } from "~screens/TokenPriceBuyScreen";
import { TokenPriceDetailScreen } from "~screens/TokenPriceDetailScreen";
import { TokenPriceListScreen } from "~screens/TokenPriceListScreen";
import { TokenPriceSwapScreen } from "~screens/TokenPriceSwapScreen";

const Stack = createNativeStackNavigator<TokenPriceStackParamList>();
export function TokenPriceNavigator(): JSX.Element {
  // const theme = useTheme();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TokenPriceList"
        component={TokenPriceListScreen}
        options={{ title: "Token Prices" }}
      />
      <Stack.Screen
        name="TokenPriceDetail"
        component={TokenPriceDetailScreen}
        options={({ route }) => {
          return {
            title: route.params.title,
            headerRight: () => <HeaderButton name="star-outline" />,
          };
        }}
      />
      <Stack.Screen name="TokenPriceBuy" component={TokenPriceBuyScreen} />
      <Stack.Screen name="TokenPriceSwap" component={TokenPriceSwapScreen} />
    </Stack.Navigator>
  );
}
