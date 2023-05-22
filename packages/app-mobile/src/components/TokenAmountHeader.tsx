import type { BigNumber } from "ethers";

import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { StyledText } from "@coral-xyz/tamagui";
import { ethers } from "ethers";

import { ProxyImage } from "~components/index";

type TokenAmountHeaderProps = {
  style?: StyleProp<ViewStyle>;
  token: {
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  amount: BigNumber;
  displayLogo?: boolean;
};

export const TokenAmountHeader = ({
  style,
  token,
  amount,
  displayLogo = true,
}: TokenAmountHeaderProps): JSX.Element => {
  const formattedAmount = ethers.utils.formatUnits(amount, token.decimals);
  const maxChars = displayLogo ? 8 : 12;
  const maybeTruncatedAmount =
    formattedAmount.length > maxChars
      ? formattedAmount.slice(0, maxChars) + "..."
      : formattedAmount;

  return (
    <View style={[styles.container, style]}>
      {displayLogo ? <ProxyImage src={token.logo} style={styles.logo} /> : null}
      <View style={styles.container}>
        <StyledText fontWeight="600" fontSize="$4xl" color="$fontColor">
          {maybeTruncatedAmount}
        </StyledText>
        <StyledText fontWeight="500" fontSize="$4xl" color="$secondary">
          {token.ticker ?? ""}
        </StyledText>
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
});
