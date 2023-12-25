import { StyleSheet, View } from "react-native";
import { useSuspenseQuery } from "@apollo/client";
import { UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import type { ColorTokens, SizeTokens } from "@coral-xyz/tamagui";
import { ListItemIconCore, useTheme } from "@coral-xyz/tamagui";

import type { ProviderId } from "../../apollo/graphql";

import { GET_TOKEN_LOGO_QUERY } from "./TransactionListItemIcon";

export const TransactionListItemIconSwap = ({
  containerSize,
  symbols,
  borderColor,
}: {
  borderColor: ColorTokens;
  containerSize?: SizeTokens;
  symbols: [string, string];
}) => {
  const theme = useTheme();
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
        {fromIcon === UNKNOWN_ICON_SRC ? (
          <FallbackCheckIcon size={size} />
        ) : (
          <ListItemIconCore
            image={fromIcon}
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
        {toIcon === UNKNOWN_ICON_SRC ? (
          <FallbackCheckIcon size={size} />
        ) : (
          <ListItemIconCore
            image={toIcon}
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
  lucideContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
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
