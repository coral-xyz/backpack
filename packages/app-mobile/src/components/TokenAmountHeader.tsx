import type { BigNumber } from "ethers";

import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";

import { XStack, StyledText } from "@coral-xyz/tamagui";
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
    <XStack ai="center" als="center">
      {displayLogo ? (
        <ProxyImage size={32} src={token.logo!} style={styles.logo} />
      ) : null}
      <XStack ai="center" als="center" space={6}>
        <StyledText fontWeight="600" fontSize="$4xl" color="$fontColor">
          {maybeTruncatedAmount}
        </StyledText>
        <StyledText fontWeight="500" fontSize="$4xl" color="$secondary">
          {token.ticker ?? ""}
        </StyledText>
      </XStack>
    </XStack>
  );
};

const styles = StyleSheet.create({
  logo: {
    borderRadius: 16,
    marginRight: 8,
  },
});
