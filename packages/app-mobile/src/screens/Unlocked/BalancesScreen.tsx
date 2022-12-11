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
import { createStackNavigator } from "@react-navigation/stack";
import { RecentActivityList } from "@screens/Unlocked/RecentActivityScreen";

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
  const { address } = token;

  // We only use ethereumWallet here, even though its shared on the Solana side too.
  const ethereumWallet = useActiveEthereumWallet();
  // Hack: This is hit for some reason due to the framer-motion animation.
  if (!blockchain || !address) {
    return <></>;
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

// TODO(peter) figure out if token == null
function TokenHeader({ blockchain, address }: SearchParamsFor.Token["props"]) {
  const [token] = useLoader(blockchainTokenData({ blockchain, address }), null);

  if (!token) return <></>;

  const percentClass =
    token.recentPercentChange === undefined
      ? ""
      : token.recentPercentChange > 0
      ? styles.positivePercent
      : styles.negativePercent;

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
        <Text style={styles.usdBalanceLabel}>
          ${parseFloat(token.usdBalance.toFixed(2)).toLocaleString()}{" "}
          <span style={percentClass}>{token.recentPercentChange}%</span>
        </Text>
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
  positivePercent: {
    // color: theme.custom.colors.positive,
  },
  negativePercent: {
    // color: theme.custom.colors.negative,
  },
  usdBalanceLabel: {
    // color: theme.custom.colors.secondary,
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
