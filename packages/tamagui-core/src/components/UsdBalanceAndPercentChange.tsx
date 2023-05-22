import { StyleSheet, Text, View } from "react-native";

import { useCustomTheme as useTheme } from "../hooks";

// Used in BalanceDetail TokenHeader, slightly diff than the other one
function RecentPercentChange({
  recentPercentChange,
}: {
  recentPercentChange: number | undefined;
}): JSX.Element {
  const theme = useTheme();
  const color =
    recentPercentChange === undefined
      ? ""
      : recentPercentChange > 0
      ? theme.custom.colors.positive
      : theme.custom.colors.negative;

  return <Text style={{ color }}>{recentPercentChange}%</Text>;
}

// Used in BalanceDetail TokenHeader, slightly diff than other recent percent changes
export function UsdBalanceAndPercentChange({
  usdBalance,
  recentPercentChange,
}: {
  usdBalance: number;
  recentPercentChange: number | undefined;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.usdBalanceLabel,
          { color: theme.custom.colors.secondary },
        ]}
      >
        ${parseFloat(usdBalance.toFixed(2)).toLocaleString()}{" "}
        <RecentPercentChange recentPercentChange={recentPercentChange} />
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  usdBalanceLabel: {
    fontWeight: "500",
    fontSize: 18,
    textAlign: "center",
    marginTop: 2,
  },
});
