import { Margin, Screen } from "@components";
import { TransferWidget } from "@components/Unlocked/Balances/TransferWidget";
import type { Blockchain } from "@coral-xyz/common";
import {
  ETH_NATIVE_MINT,
  // NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  toTitleCase,
  // walletAddressDisplay,
} from "@coral-xyz/common";
import { createStackNavigator } from "@react-navigation/stack";

import { TokenTables } from "./components/Balances";
import { BalanceSummaryWidget } from "./components/BalanceSummaryWidget";
import type { Token } from "./components/index";

const Stack = createStackNavigator();

export function BalancesNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="BalanceList"
      screenOptions={{ presentation: "modal" }}
    >
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BalanceList" component={BalanceListScreen} />
      </Stack.Group>
      <Stack.Screen
        name="BalanceDetail"
        component={BalanceDetailScreen}
        options={({ route: { params } }) => {
          const title = `${toTitleCase(params.blockchain)} / ${
            params.token.ticker
          }`;
          return {
            title,
          };
        }}
      />
    </Stack.Navigator>
  );
}

function BalanceDetailScreen({ route, navigation }) {
  const { blockchain, token } = route.params;

  const onNavigate = (route) => navigation.navigate(route);

  return (
    <Screen>
      <TransferWidget rampEnabled={false} onNavigate={onNavigate} />
    </Screen>
  );
}

function BalanceListScreen({ navigation }) {
  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("BalanceDetail", { token, blockchain });
  };

  const onNavigate = (route) => navigation.navigate(route);

  return (
    <Screen>
      <Margin vertical={12}>
        <BalanceSummaryWidget />
      </Margin>
      <TransferWidget rampEnabled={false} onNavigate={onNavigate} />
      <TokenTables
        onPressRow={onPressTokenRow}
        customFilter={(token: Token) => {
          if (token.mint && token.mint === SOL_NATIVE_MINT) {
            return true;
          }
          if (token.address && token.address === ETH_NATIVE_MINT) {
            return true;
          }
          return !token.nativeBalance.isZero();
        }}
      />
    </Screen>
  );
}
