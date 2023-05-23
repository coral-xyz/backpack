import { View, type ViewStyle } from "react-native";
import { UNKNOWN_ICON_SRC, useJupiterTokenList } from "@coral-xyz/recoil";
import type { SizeTokens } from "@coral-xyz/tamagui";
import { ListItemIconCore, TamaguiIcons } from "@coral-xyz/tamagui";

const wrapperStyles = (size: SizeTokens): ViewStyle => ({
  height: size,
  width: size,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export type TransactionListItemIconTypeProps = {
  size: SizeTokens;
};

export const TransactionListItemIconBurn = ({
  size,
}: TransactionListItemIconTypeProps) => (
  <View style={wrapperStyles(size)}>
    <TamaguiIcons.Flame color="$negative" />
  </View>
);

export const TransactionListItemIconDefault = ({
  size,
}: TransactionListItemIconTypeProps) => (
  <View style={wrapperStyles(size)}>
    <TamaguiIcons.Check color="$positive" />
  </View>
);

export const TransactionListItemIconError = ({
  size,
}: TransactionListItemIconTypeProps) => (
  <View style={wrapperStyles(size)}>
    <TamaguiIcons.X color="$negative" />
  </View>
);

export const TransactionListItemIconReceived = ({
  size,
}: TransactionListItemIconTypeProps) => (
  <View style={wrapperStyles(size)}>
    <TamaguiIcons.ArrowDown color="$secondary" />
  </View>
);

export const TransactionListItemIconSwap = ({
  symbols,
}: TransactionListItemIconTypeProps & {
  symbols: [string, string];
}) => {
  const jupiter = useJupiterTokenList();
  const logos = symbols.map(
    (s) => jupiter.find((j) => j.symbol === s)?.logoURI ?? UNKNOWN_ICON_SRC
  );

  return (
    <View
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      <ListItemIconCore
        style={{ marginRight: 10, marginBottom: 15 }}
        radius={12}
        size={24}
        image={logos[0]}
      />
      <ListItemIconCore
        style={{ marginLeft: -15, zIndex: 10 }}
        radius={12}
        size={24}
        image={logos[1]}
      />
    </View>
  );
};

export const TransactionListItemIconTransfer = ({
  size,
  symbol,
}: TransactionListItemIconTypeProps & { symbol: string }) => {
  const jupiter = useJupiterTokenList();
  const logo =
    jupiter.find((j) => j.symbol === symbol)?.logoURI ?? UNKNOWN_ICON_SRC;

  return (
    <View style={wrapperStyles(size)}>
      <ListItemIconCore size={size} radius={22} image={logo} />
    </View>
  );
};
