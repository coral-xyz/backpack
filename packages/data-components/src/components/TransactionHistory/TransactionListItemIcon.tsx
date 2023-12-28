import { StyleSheet, View } from "react-native";
import { UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import type { SizeTokens } from "@coral-xyz/tamagui";
import {
  CheckIcon,
  FlameIcon,
  ListItemIconCore,
  XIcon,
} from "@coral-xyz/tamagui";

import { useTokenLogo } from "./utils";

export { TransactionListItemIconSwap } from "./TransactionListItemIconSwap";

const styles = StyleSheet.create({
  lucideContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  swapContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export type TransactionListItemIconTypeProps = {
  size: number;
};

export type TransactionListItemLucideIconProps = {
  containerSize?: SizeTokens;
};

export const TransactionListItemIconBurn = ({
  containerSize,
  size,
}: TransactionListItemIconTypeProps & TransactionListItemLucideIconProps) => (
  <View
    style={[
      styles.lucideContainer,
      { height: containerSize ?? size, width: containerSize ?? size },
    ]}
  >
    <FlameIcon color="$redIcon" size={size} />
  </View>
);

export const TransactionListItemIconDefault = ({
  containerSize,
  size,
}: TransactionListItemIconTypeProps & TransactionListItemLucideIconProps) => (
  <View
    style={[
      styles.lucideContainer,
      { height: containerSize ?? size, width: containerSize ?? size },
    ]}
  >
    <CheckIcon color="$greenIcon" size={size} />
  </View>
);

export const TransactionListItemIconError = ({
  containerSize,
  size,
}: TransactionListItemIconTypeProps & TransactionListItemLucideIconProps) => (
  <View
    style={[
      styles.lucideContainer,
      { height: containerSize ?? size, width: containerSize ?? size },
    ]}
  >
    <XIcon color="$redIcon" size={size} />
  </View>
);

export const TransactionListItemIconNft = ({
  mint,
  size,
}: TransactionListItemIconTypeProps & { mint?: string }) => (
  <ListItemIconCore
    image={
      mint
        ? `https://swr.xnftdata.com/nft-data/metaplex-nft/${mint}/image`
        : UNKNOWN_NFT_ICON_SRC
    }
    radius={8}
    size={size}
  />
);

export const TransactionListItemIconTransfer = ({
  name,
  size,
  symbol,
}: TransactionListItemIconTypeProps & { name?: string; symbol?: string }) => {
  const logo = useTokenLogo({ name, symbol });
  return <ListItemIconCore image={logo} radius="$circular" size={size} />;
};
