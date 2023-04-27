import { StyleSheet, Text, View } from "react-native";

import { gql, useQuery } from "@apollo/client";
import { formatUSD } from "@coral-xyz/common";
import { XStack } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";
import { graphQLSelector } from "recoil-relay";
import { graphql } from "relay-runtime";

import { StyledText } from "~components/index";
import { useTotalBalance } from "~hooks/recoil";
import { useTheme } from "~hooks/useTheme";

import { RelayEnvironmentKey } from "../../../relay/environment";

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

const walletQuery = graphQLSelector({
  key: "WalletBalanceSummaryOk",
  environment: RelayEnvironmentKey,
  query: graphql`
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
  `,
  variables: ({ get }) => ({
    chainId: "SOLANA",
    address: "5iM4vFHv7vdiZJYm7rQwHGgvpp9zHEwZHGNbNATFF5To",
  }),
  mapResponse: (data) => data,
});

export function BalanceSummaryWidget() {
  const data2 = useRecoilValue(walletQuery);
  console.log("debug2:data2", data2);
  const data = useQuery(GET_BALANCE_SUMMARY, {
    variables: {
      chainId: "SOLANA",
      address: "5iM4vFHv7vdiZJYm7rQwHGgvpp9zHEwZHGNbNATFF5To",
    },
  });

  console.log("debugg2:data", data);

  const { totalBalance, totalChange, percentChange, isLoading } =
    useTotalBalance();

  return (
    <View style={styles.container}>
      <StyledText mb={8} fontWeight="700" fontSize="$4xl" color="$fontColor">
        {formatUSD(totalBalance)}
      </StyledText>
      <XStack alignItems="center">
        <TextTotalChange totalChange={totalChange} />
        <TextPercentChange
          isLoading={isLoading}
          totalChange={totalChange}
          percentChange={percentChange as number}
        />
      </XStack>
    </View>
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
