import type { StyleProp, ViewStyle } from "react-native";
import { Image, Text, View } from "react-native";
// import { ProxyImage } from "./ProxyImage";
import { useTheme } from "@hooks";
import type { BigNumber } from "ethers";
import { ethers } from "ethers";

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
    <View style={style}>
      {/* Dummy padding to center flex content */}
      <View style={{ flex: 1 }} />
      {displayLogo && (
        <View
          style={{
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <Image
            source={{ uri: token.logo }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
            }}
            // onError={(event: any) =>
            //   (event.currentTarget.style.display = "none")
            // }
          />
        </View>
      )}
      <Text
        style={[
          {
            color: theme.custom.colors.fontColor,
            fontWeight: "500",
            fontSize: 30,
            lineHeight: 36,
            textAlign: "center",
          },
        ]}
      >
        {maybeTruncatedAmount}
        <Text style={{ marginLeft: 8, color: theme.custom.colors.secondary }}>
          {token.ticker}
        </Text>
      </Text>
      {/* Dummy padding to center flex content */}
      <View style={{ flex: 1 }} />
    </View>
  );
};
