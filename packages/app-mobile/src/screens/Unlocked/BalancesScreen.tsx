import { StyleSheet, Text, View } from "react-native";
import { Margin, Screen, TokenAmountHeader } from "@components";
import { TransferWidget } from "@components/Unlocked/Balances/TransferWidget";
import {
  Blockchain,
  ETH_NATIVE_MINT,
  // NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  toTitleCase,
  // walletAddressDisplay,
} from "@coral-xyz/common";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import {
  blockchainTokenData,
  useActiveEthereumWallet,
  useLoader,
} from "@coral-xyz/recoil";
import { useTheme } from "@hooks";
import { createStackNavigator } from "@react-navigation/stack";
import { RecentActivityList } from "@screens/Unlocked/RecentActivityScreen";

import { TokenTables, UsdBalanceAndPercentChange } from "./components/Balances";
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
  const { address } = token;

  // We only use ethereumWallet here, even though its shared on the Solana side too.
  const ethereumWallet = useActiveEthereumWallet();
  if (!blockchain || !address) {
    return null;
  }

  const activityAddress =
    blockchain === Blockchain.ETHEREUM ? ethereumWallet.publicKey : address;
  const contractAddresses =
    blockchain === Blockchain.ETHEREUM ? [address] : undefined;

  return (
    <Screen>
      <TokenHeader blockchain={blockchain} address={address} />
      <RecentActivityList
        blockchain={blockchain}
        address={activityAddress}
        contractAddresses={contractAddresses}
        minimize={true}
        style={{ marginTop: 0 }}
      />
    </Screen>
  );
}

function TokenHeader({ blockchain, address }: SearchParamsFor.Token["props"]) {
  const theme = useTheme();
  const [token] = useLoader(blockchainTokenData({ blockchain, address }), null);

  if (!token) return null;

  return (
    <View
      style={{
        paddingTop: 38,
        marginBottom: 24,
      }}
    >
      <View>
        <TokenAmountHeader
          token={token}
          amount={token.nativeBalance}
          displayLogo={false}
        />
        <UsdBalanceAndPercentChange
          usdBalance={token.usdBalance}
          recentPercentChange={token.recentPercentChange}
        />
      </View>
      <View style={styles.tokenHeaderButtonContainer}>
        <TransferWidget
          blockchain={blockchain}
          address={address}
          rampEnabled={
            (blockchain === Blockchain.SOLANA && token.ticker === "SOL") ||
            (blockchain === Blockchain.ETHEREUM && token.ticker === "ETH")
          }
        />
      </View>
    </View>
  );
}

function BalanceListScreen({ navigation }) {
  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("BalanceDetail", { token, blockchain });
  };

  const onNavigate = (route) => navigation.navigate(route);

  return (
    <Screen>
      <Margin bottom={18}>
        <BalanceSummaryWidget />
      </Margin>
      <Margin bottom={18}>
        <TransferWidget rampEnabled={false} onNavigate={onNavigate} />
      </Margin>
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

const styles = StyleSheet.create({
  tokenHeaderButtonContainer: {
    justifyContent: "space-between",
    marginTop: 24,
  },
  usdBalanceLabel: {
    fontWeight: "500",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 24,
  },
  headerButtonLabel: {
    // color: theme.custom.colors.fontColor,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "500",
  },
});
