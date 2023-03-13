import type { StackScreenProps } from "@react-navigation/stack";

import { StyleSheet, View } from "react-native";

import { Token, NavTokenAction, NavTokenOptions } from "@@types/types";
import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import { createStackNavigator } from "@react-navigation/stack";

import { TransferWidget } from "~components/Unlocked/Balances/TransferWidget";
import { Margin, Screen, TokenAmountHeader } from "~components/index";
import {
  useBlockchainTokenData,
  useBlockchainActiveWallet,
  useActiveEthereumWallet,
} from "~hooks/recoil";
import { RecentActivityList } from "~screens/Unlocked/RecentActivityScreen";

import { BalanceSummaryWidget } from "./components/BalanceSummaryWidget";
import { TokenTables, UsdBalanceAndPercentChange } from "./components/Balances";

function TokenHeader({
  blockchain,
  address,
  onPressOption,
}: {
  blockchain: Blockchain;
  address: string;
  onPressOption: (route: NavTokenAction, options: NavTokenOptions) => void;
}) {
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
          onPressOption={onPressOption}
          rampEnabled={
            (blockchain === Blockchain.SOLANA && token.ticker === "SOL") ||
            (blockchain === Blockchain.ETHEREUM && token.ticker === "ETH")
          }
        />
      </View>
    </View>
  );
}

function BalanceDetailScreen({
  route,
  navigation,
}: StackScreenProps<
  BalancesStackParamList,
  "BalanceDetail"
>): JSX.Element | null {
  const { blockchain, tokenAddress } = route.params;

  // We only use ethereumWallet here, even though its shared on the Solana side too.
  const { data: ethereumWallet, loading } = useActiveEthereumWallet();
  if (!blockchain || !tokenAddress || loading) {
    return null;
  }

  const activityAddress =
    blockchain === Blockchain.ETHEREUM
      ? ethereumWallet.publicKey
      : tokenAddress;
  const contractAddresses =
    blockchain === Blockchain.ETHEREUM ? [tokenAddress] : undefined;

  return (
    <Screen>
      <TokenHeader
        blockchain={blockchain}
        address={tokenAddress}
        onPressOption={(route: string, options: NavTokenOptions) => {
          navigation.push(route, options);
        }}
      />
      <RecentActivityList
        blockchain={blockchain}
        address={activityAddress}
        contractAddresses={contractAddresses}
        minimize
        style={{ marginTop: 18 }}
      />
    </Screen>
  );
}

function BalanceListScreen({
  navigation,
}: StackScreenProps<BalancesStackParamList, "BalanceList">): JSX.Element {
  return (
    <Screen>
      <Margin bottom={18}>
        <BalanceSummaryWidget />
      </Margin>
      <Margin bottom={18}>
        <TransferWidget
          swapEnabled={false}
          rampEnabled={false}
          onPressOption={(route: string, options: NavTokenOptions) => {
            navigation.push(route, options);
          }}
        />
      </Margin>
      <TokenTables
        onPressRow={(blockchain: Blockchain, token: Token) => {
          navigation.push("BalanceDetail", {
            blockchain,
            tokenAddress: token.address,
            tokenTicker: token.ticker,
          });
        }}
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

type BalancesStackParamList = {
  BalanceList: undefined;
  BalanceDetail: {
    blockchain: Blockchain;
    tokenAddress: string;
    tokenTicker: string;
  };
};

const Stack = createStackNavigator<BalancesStackParamList>();
export function BalancesNavigator(): JSX.Element {
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
        options={({
          route: {
            params: { blockchain, tokenTicker },
          },
        }) => {
          const title = `${toTitleCase(blockchain)} / ${tokenTicker}`;
          return {
            title,
          };
        }}
      />
    </Stack.Navigator>
  );
}
