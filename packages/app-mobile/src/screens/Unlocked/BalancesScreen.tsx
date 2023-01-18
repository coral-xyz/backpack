import type { Token } from "./components/index";
import type { SearchParamsFor } from "@coral-xyz/recoil";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { Margin, Screen, TokenAmountHeader } from "@components";
import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { RecentActivityList } from "@screens/Unlocked/RecentActivityScreen";
import { WalletListScreen } from "@screens/Unlocked/WalletListScreen";
import { useRecoilValueLoadable } from "recoil";

import { TransferWidget } from "@components/Unlocked/Balances/TransferWidget";
import {
  useBlockchainTokenData,
  useBlockchainActiveWallet,
  useActiveEthereumWallet,
} from "@hooks/recoil";

import { BalanceSummaryWidget } from "./components/BalanceSummaryWidget";
import { TokenTables, UsdBalanceAndPercentChange } from "./components/Balances";

const Stack = createStackNavigator();
export function BalancesNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="BalanceList"
      screenOptions={{ presentation: "modal" }}
    >
      <Stack.Screen
        name="wallet-picker"
        component={WalletListScreen}
        options={({ navigation }) => {
          return {
            title: "Wallets",
            headerLeft: undefined,
            headerRight: ({ tintColor }) => {
              return (
                <Pressable onPress={() => navigation.navigate("edit-wallets")}>
                  <MaterialIcons
                    name="settings"
                    size={24}
                    style={{ padding: 8 }}
                    color={tintColor}
                  />
                </Pressable>
              );
            },
          };
        }}
      />
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

function TokenHeader({
  blockchain,
  address,
  onPressOption,
}: SearchParamsFor.Token["props"]) {
  const { data: wallet } = useBlockchainActiveWallet(blockchain);
  const { data: token, loading } = useBlockchainTokenData({
    publicKey: wallet.publicKey.toString(),
    blockchain,
    tokenAddress: address,
  });

  if (!token || loading) {
    return null;
  }

  return (
    <View>
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
          token={token}
          blockchain={blockchain}
          address={address}
          rampEnabled={
            (blockchain === Blockchain.SOLANA && token.ticker === "SOL") ||
            (blockchain === Blockchain.ETHEREUM && token.ticker === "ETH")
          }
          onPressOption={onPressOption}
        />
      </View>
    </View>
  );
}

function BalanceDetailScreen({ route, navigation }) {
  const { blockchain, token } = route.params;
  const { address } = token;

  // We only use ethereumWallet here, even though its shared on the Solana side too.
  const { data: ethereumWallet, loading } = useActiveEthereumWallet();
  if (!blockchain || !address || loading) {
    return null;
  }

  const activityAddress =
    blockchain === Blockchain.ETHEREUM ? ethereumWallet.publicKey : address;
  const contractAddresses =
    blockchain === Blockchain.ETHEREUM ? [address] : undefined;

  const handlePressOption = (
    route: "Receive" | "Send" | "Swap",
    options: any
  ) => {
    const name = route === "Receive" ? "DepositSingle" : "SendTokenModal";
    navigation.push(name, options);
  };

  return (
    <Screen>
      <TokenHeader
        blockchain={blockchain}
        address={address}
        onPressOption={handlePressOption}
      />
      <RecentActivityList
        blockchain={blockchain}
        address={activityAddress}
        contractAddresses={contractAddresses}
        minimize
        style={{ marginTop: 0 }}
      />
    </Screen>
  );
}

function BalanceListScreen({ navigation }) {
  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("BalanceDetail", { token, blockchain });
  };

  const handlePressOption = (
    route: "Receive" | "Send" | "Swap",
    options: any
  ) => {
    const name = route === "Receive" ? "DepositList" : "SendSelectTokenModal";
    navigation.push(name, options);
  };

  return (
    <Screen>
      <Margin bottom={18}>
        <BalanceSummaryWidget />
      </Margin>
      <Margin bottom={18}>
        <TransferWidget rampEnabled={false} onPressOption={handlePressOption} />
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
});
