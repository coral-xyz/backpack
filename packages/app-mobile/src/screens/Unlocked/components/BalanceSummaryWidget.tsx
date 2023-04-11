import { StyleSheet, Text, View } from "react-native";

import { formatUSD } from "@coral-xyz/common";

import { StyledText } from "~components/index";
import { useTotalBalance } from "~hooks/recoil";
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

export function BalanceSummaryWidget() {
  const { totalBalance, totalChange, percentChange, isLoading } =
    useTotalBalance();

  return (
    <View style={styles.container}>
      <StyledText
        marginBottom={12}
        fontWeight="700"
        fontSize={36}
        color="$fontColor"
      >
        {formatUSD(totalBalance)}
      </StyledText>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextTotalChange totalChange={totalChange} />
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
