import { Platform, StyleSheet, View } from "react-native";
import { useSuspenseQuery } from "@apollo/client";
import { UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import type { ColorTokens, SizeTokens } from "@coral-xyz/tamagui";
import { ListItemIconCore } from "@coral-xyz/tamagui";

import type { ProviderId } from "../../apollo/graphql";

import { GET_TOKEN_LOGO_QUERY } from "./TransactionListItemIcon";

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

export const TransactionListItemIconSwap = ({
  containerSize,
  symbols,
  borderColor,
}: {
  borderColor: ColorTokens;
  containerSize?: SizeTokens;
  symbols: [string, string];
}) => {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery(GET_TOKEN_LOGO_QUERY, {
    variables: {
      providerId: activeWallet.blockchain.toUpperCase() as ProviderId,
      filters: {
        symbols,
      },
    },
  });

  const size = Number(containerSize) * 0.8;
  const [nameFrom, nameTo] = symbols;

  const symbolToLogoMap = new Map<string, string>();

  data.tokenList.forEach((token) => {
    if (token && token.symbol && token.logo) {
      symbolToLogoMap.set(token.symbol, token.logo);
    }
  });

  const fromIcon = symbolToLogoMap.get(nameFrom) || UNKNOWN_ICON_SRC;
  const toIcon = symbolToLogoMap.get(nameTo) || UNKNOWN_ICON_SRC;

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
        image={fromIcon}
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
        image={toIcon}
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
