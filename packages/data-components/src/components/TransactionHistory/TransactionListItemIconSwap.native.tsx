import { UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import type { ColorTokens } from "@coral-xyz/tamagui";
import { ListItemIconCore, useTheme } from "@coral-xyz/tamagui";
import { StyleSheet, View } from "react-native";

import { useTokenLogo } from "./utils";

export const TransactionListItemIconSwap = ({
  containerSize,
  symbols,
  borderColor,
}: {
  borderColor: ColorTokens;
  containerSize: number;
  symbols: [string, string];
}) => {
  const theme = useTheme();
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
          backgroundColor: theme.card.val,
        },
      ]}
    >
      <View
        style={{
          borderRadius: 100,
          width: size,
          height: size,
          marginBottom: Number(size) * 0.275,
          zIndex: 9,
        }}
      >
        {fromToken === UNKNOWN_ICON_SRC ? (
          <FallbackCheckIcon size={size} />
        ) : (
          <ListItemIconCore
            image={fromToken}
            borderColor={borderColor}
            radius="$circular"
            size={size}
          />
        )}
      </View>
      <View
        style={{
          marginTop: Number(size) * 0.275,
          marginLeft: Number(size) * -0.66,
          zIndex: 10,
        }}
      >
        {toToken === UNKNOWN_ICON_SRC ? (
          <FallbackCheckIcon size={size} />
        ) : (
          <ListItemIconCore
            image={toToken}
            borderColor={borderColor}
            radius="$circular"
            size={size}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  swapContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

function FallbackCheckIcon({ size }: { size: number }): JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.baseBackgroundL0.val,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ListItemIconCore
        image={UNKNOWN_ICON_SRC}
        radius="$circular"
        size={size}
        style={{
          width: size,
          height: size,
        }}
      />
    </View>
  );
}
