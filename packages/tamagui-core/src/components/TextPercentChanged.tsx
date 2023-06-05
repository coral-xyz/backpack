import { StyleSheet, Text } from "react-native";
import { formatUsd } from "@coral-xyz/common";

import { useCustomTheme as useTheme } from "../hooks";

export function TextPercentChanged({
  percentChange,
}: {
  percentChange: number;
}): JSX.Element {
  const theme = useTheme();
  const positive = !!(percentChange && percentChange > 0);
  const negative = !!(percentChange && percentChange < 0);
  const neutral = !!(percentChange && percentChange === 0);

  return (
    <>
      {percentChange !== undefined && positive ? (
        <Text
          style={[
            styles.tokenBalanceChangePositive,
            { color: theme.custom.colors.positive },
          ]}
        >
          +{formatUsd(percentChange.toLocaleString())}
        </Text>
      ) : null}
      {percentChange !== undefined && negative ? (
        <Text
          style={[
            styles.tokenBalanceChangeNegative,
            { color: theme.custom.colors.negative },
          ]}
        >
          {formatUsd(percentChange.toLocaleString())}
        </Text>
      ) : null}
      {percentChange !== undefined && neutral ? (
        <Text
          style={[
            styles.tokenBalanceChangeNeutral,
            { color: theme.custom.colors.secondary },
          ]}
        >
          {formatUsd(percentChange.toLocaleString())}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  tokenBalanceChangeNeutral: {
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
  },
  tokenBalanceChangePositive: {
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
  },
  tokenBalanceChangeNegative: {
    fontWeight: "500",
    fontSize: 12,
  },
});
