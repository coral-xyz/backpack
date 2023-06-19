import { Suspense } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useSuspenseQuery } from "@apollo/client";
import { formatUsd } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import { Stack, XStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { StyledText } from "~components/index";
import { useTheme } from "~hooks/useTheme";

import { BalanceSummaryWidgetLoading } from "~src/components/LoadingStates";
import { gql } from "~src/graphql/__generated__";

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
      {formatUsd(totalChange)}
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
        {totalChange > 0 ? "+" : ""}
        {Number.isFinite(percentChange)
          ? `${percentChange.toFixed(2)}%`
          : "0.00%"}
      </Text>
    </View>
  );
}

const QUERY_USER_BALANCE_SUMMARY = gql(`
  query UserWalletBalanceSummary($address: String!) {
    user {
      id
      wallet(address: $address) {
        id
        isPrimary
        provider {
          id
          name
          logo
        }
        balances {
          aggregate {
            id
            percentChange
            value
            valueChange
          }
        }
      }
    }
  }
`);

function Container() {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery(QUERY_USER_BALANCE_SUMMARY, {
    variables: {
      address: activeWallet.publicKey,
    },
  });

  const aggregate = data.user?.wallet?.balances?.aggregate;
  const totalBalance = aggregate?.value ?? 0.0;
  const totalChange = aggregate?.valueChange ?? 0.0;
  const percentChange = aggregate?.percentChange ?? 0.0;

  return (
    <Stack ai="center">
      <StyledText fontWeight="700" fontSize="$4xl" color="$fontColor">
        {formatUsd(totalBalance)}
      </StyledText>
      <XStack alignItems="center">
        <TextTotalChange totalChange={totalChange} />
        <TextPercentChange
          isLoading={false}
          totalChange={totalChange}
          percentChange={percentChange as number}
        />
      </XStack>
    </Stack>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={{ height: 72, opacity: 0.5 }}>
      <StyledText color="$redText" textAlign="center">
        Something went wrong:
      </StyledText>
      <StyledText textAlign="center">{error.message}</StyledText>
    </View>
  );
}

export function BalanceSummaryWidget() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<BalanceSummaryWidgetLoading />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  totalChangeText: {
    fontSize: 16,
  },
  percentChangeText: {
    fontSize: 16,
    lineHeight: 24,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
