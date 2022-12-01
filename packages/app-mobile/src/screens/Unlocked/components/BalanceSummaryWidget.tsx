import { View, Text, StyleSheet } from "react-native";
import { formatUSD } from "@coral-xyz/common";
import { HOVER_OPACITY } from "@coral-xyz/themes";
import {
  totalBalance as totalBalanceSelector,
  useLoader,
} from "@coral-xyz/recoil";
import { useTheme } from "@hooks";
import { Margin } from "@components";

function TextTotalChange({ totalChange }) {
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

function TextPercentChange({ isLoading, totalChange, percentChange }) {
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
    <Text style={[styles.percentChangeText, { backgroundColor, color }]}>
      {totalChange > 0 ? "+" : ""}
      {Number.isFinite(percentChange)
        ? `${percentChange.toFixed(2)}%`
        : "0.00%"}
    </Text>
  );
}

export function BalanceSummaryWidget() {
  const theme = useTheme();
  // const [{ totalBalance, totalChange, percentChange }, _, isLoading] =
  //   useLoader(totalBalanceSelector, {
  //     totalBalance: 0,
  //     totalChange: 0,
  //     percentChange: 0,
  //   });

  const isLoading = false;
  const { totalBalance, totalChange, percentChange } = {
    totalBalance: 386.23,
    totalChange: -32.33,
    percentChange: -7.72,
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.totalBalanceText,
          { color: theme.custom.colors.fontColor },
        ]}
      >
        {formatUSD(totalBalance)}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Margin right={12}>
          <TextTotalChange totalChange={totalChange} />
        </Margin>
        <TextPercentChange
          isLoading={isLoading}
          totalChange={totalChange}
          percentChange={percentChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  totalBalanceText: {
    fontWeight: "600",
    fontSize: 40,
    // lineHeight: 36,
    // color: "inherit",
  },
  totalChangeText: {
    fontSize: 12,
    lineHeight: 24,
    paddingVeritcal: 12,
  },
  percentChangeText: {
    fontSize: 12,
    lineHeight: 24,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVeritcal: 2,
  },
  positive: {
    // color: `${theme.custom.colors.positive} !important`,
    fontSize: 12,
    lineHeight: 24,
  },
  negative: {
    // color: theme.custom.colors.negative,
    fontSize: 12,
    lineHeight: 24,
  },
});
