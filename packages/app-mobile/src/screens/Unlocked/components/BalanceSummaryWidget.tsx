import { Suspense } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";

import { gql, useSuspenseQuery_experimental } from "@apollo/client";
import { formatUSD } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import { XStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { StyledText } from "~components/index";
// import { useTotalBalance } from "~hooks/recoil";
import { useTheme } from "~hooks/useTheme";

function TextTotalChange({
  totalChange,
}: {
  totalChange: number;
}): JSX.Element {
  const theme = useTheme();
  const color =
    totalChange === 0
      ? theme.custom.colors.neutral
      : totalChange < 0
      ? theme.custom.colors.negative
      : theme.custom.colors.positive;

  return (
    <Text style={[styles.totalChangeText, { color }]}>
      {formatUSD(totalChange)}
    </Text>
  );
}

function TextPercentChange({
  isLoading,
  totalChange,
  percentChange,
}: {
  isLoading: boolean;
  totalChange: number;
  percentChange: number;
}): JSX.Element {
  const theme = useTheme();
  const color =
    totalChange === 0
      ? theme.custom.colors.neutral
      : totalChange < 0
      ? theme.custom.colors.negative
      : theme.custom.colors.positive;

  const backgroundColor = isLoading
    ? undefined
    : totalChange === 0
    ? theme.custom.colors.balanceChangeNeutral
    : totalChange < 0
    ? theme.custom.colors.balanceChangeNegative
    : theme.custom.colors.balanceChangePositive;

  return (
    <View style={{ borderRadius: 12, backgroundColor }}>
      <Text style={[styles.percentChangeText, { color }]}>
        ({totalChange > 0 ? "+" : ""}
        {Number.isFinite(percentChange)
          ? `${percentChange.toFixed(2)}%`
          : "0.00%"}
        )
      </Text>
    </View>
  );
}

const GET_BALANCE_SUMMARY = gql`
  query WalletBalanceSummary($chainId: ChainID!, $address: String!) {
    wallet(chainId: $chainId, address: $address) {
      id
      balances {
        aggregateValue
        native {
          id
          address
          amount
          decimals
          displayAmount
          marketData {
            id
            change
            lastUpdatedAt
            logo
            price
            value
          }
        }
      }
    }
  }
`;

function Container() {
  // const { data, loading, error } = useQuery(GET_BALANCE_SUMMARY, {
  //   variables: {
  //     chainId: "SOLANA",
  //     address: "5iM4vFHv7vdiZJYm7rQwHGgvpp9zHEwZHGNbNATFF5To",
  //   },
  // });
  const { data } = useSuspenseQuery_experimental(GET_BALANCE_SUMMARY, {
    variables: {
      chainId: "SOLANA",
      address: "5iM4vFHv7vdiZJYm7rQwHGgvpp9zHEwZHGNbNATFF5To",
    },
  });

  const totalBalance = data.wallet.balances.aggregateValue;
  const totalChange = data.wallet.balances.native.marketData.change;
  // const percentChange = data.wallet.balances.native.marketData.change;

  function calculatePercentChange(marketData) {
    const { change, price } = marketData;
    const percentChange = (change / price) * 100;
    return percentChange;
  }

  const percentChange = calculatePercentChange(
    data.wallet.balances.native.marketData
  );

  return (
    <View style={styles.container}>
      <StyledText mb={8} fontWeight="700" fontSize="$4xl" color="$fontColor">
        {formatUSD(totalBalance)}
      </StyledText>
      <XStack alignItems="center">
        <TextTotalChange totalChange={totalChange} />
        <TextPercentChange
          isLoading={false}
          totalChange={totalChange}
          percentChange={percentChange as number}
        />
      </XStack>
    </View>
  );
}

export function BalanceSummaryWidget() {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error}</Text>}>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  totalChangeText: {
    fontSize: 16,
  },
  percentChangeText: {
    fontSize: 16,
    marginLeft: 4,
  },
});
