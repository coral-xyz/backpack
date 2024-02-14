import type { ColorTokens } from "@coral-xyz/tamagui";
import { ListItemIconCore } from "@coral-xyz/tamagui";
import { Platform, StyleSheet, View } from "react-native";

import { useTokenLogo } from "./utils";

const styles = StyleSheet.create({
  swapContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export const TransactionListItemIconSwap = ({
  containerSize,
  symbols,
  borderColor,
}: {
  borderColor: ColorTokens;
  containerSize?: number;
  symbols: [string, string];
}) => {
  const fromToken = useTokenLogo({ symbol: symbols[0] });
  const toToken = useTokenLogo({ symbol: symbols[1] });
  const size = Number(containerSize) * 0.8;

  return (
    <View
      style={[
        styles.swapContainer,
        {
          width: containerSize,
          height: containerSize,
        },
      ]}
    >
      <ListItemIconCore
        image={fromToken}
        borderColor={borderColor}
        radius="$circular"
        size={size}
        style={{
          marginBottom: Number(size) * 0.275,
          borderWidth: Platform.select({ web: 0, default: 2 }),
          zIndex: 9,
        }}
      />
      <ListItemIconCore
        image={toToken}
        borderColor={borderColor}
        radius="$circular"
        size={size}
        style={{
          marginTop: Number(size) * 0.275,
          marginLeft: Number(size) * -0.66,
          borderWidth: Platform.select({ web: 0, default: 2 }),
          zIndex: 10,
        }}
      />
    </View>
  );
};
