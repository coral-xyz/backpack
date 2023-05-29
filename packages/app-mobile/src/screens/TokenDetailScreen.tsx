import { Suspense, useState } from "react";
import { View, StyleSheet } from "react-native";

import { Blockchain } from "@coral-xyz/common";
import { UsdBalanceAndPercentChange } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { RecentActivityList } from "~components/RecentActivityList";
import { TransferWidget } from "~components/Unlocked/Balances/TransferWidget";
import {
  Screen,
  TokenAmountHeader,
  ScreenLoading,
  ScreenError,
} from "~components/index";
import {
  useActiveEthereumWallet,
  useBlockchainTokenData,
  useBlockchainActiveWallet,
} from "~hooks/recoil";
import type { TokenDetailScreenParams } from "~navigation/WalletsNavigator";

import { NavTokenAction, NavTokenOptions } from "~types/types";

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
    return <ScreenLoading />;
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

function Container({
  route,
  navigation,
}: TokenDetailScreenParams): JSX.Element | null {
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
      <RecentActivityList
        blockchain={blockchain}
        address={activityAddress}
        contractAddresses={contractAddresses}
        minimize
        style={{ marginTop: 18 }}
        ListHeaderComponent={
          <TokenHeader
            blockchain={blockchain}
            address={tokenAddress}
            onPressOption={(route: string, options: NavTokenOptions) => {
              navigation.push(route, options);
            }}
          />
        }
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

export function TokenDetailScreen({
  route,
  navigation,
}: TokenDetailScreenParams): JSX.Element | null {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
