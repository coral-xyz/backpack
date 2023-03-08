import type { BigNumber } from "ethers";

import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";

import { ethers } from "ethers";

import { ProxyImage } from "~components/index";
import { useTheme } from "~hooks/useTheme";

//
// Displays token amount header with logo.
//
export const TokenAmountHeader: React.FC<{
  style?: StyleProp<ViewStyle>;
  token: {
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  amount: BigNumber;
  displayLogo?: boolean;
}> = ({ style, token, amount, displayLogo = true }) => {
  const theme = useTheme();

  const formattedAmount = ethers.utils.formatUnits(amount, token.decimals);
  const maxChars = displayLogo ? 10 : 12;
  const maybeTruncatedAmount =
    formattedAmount.length > maxChars
      ? formattedAmount.slice(0, maxChars) + "..."
      : formattedAmount;

  return (
    <View style={[styles.container, style]}>
      {displayLogo ? <ProxyImage src={token.logo} style={styles.logo} /> : null}
      <View style={styles.container}>
        <Text
          style={[
            styles.amountLabel,
            {
              color: theme.custom.colors.fontColor,
            },
          ]}
        >
          {maybeTruncatedAmount}
        </Text>
        <Text
          style={[styles.tickerLabel, { color: theme.custom.colors.secondary }]}
        >
          {token.ticker}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    aspectRatio: 1,
    marginRight: 8,
  },
  amountLabel: {
    fontWeight: "500",
    fontSize: 30,
  },
  tickerLabel: {
    marginLeft: 8,
    fontWeight: "400",
    fontSize: 30,
  },
});
