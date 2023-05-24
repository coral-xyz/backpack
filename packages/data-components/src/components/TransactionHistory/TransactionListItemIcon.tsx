import { View, type ViewStyle } from "react-native";
import { useSuspenseQuery_experimental } from "@apollo/client";
import { UNKNOWN_ICON_SRC, useActiveWallet } from "@coral-xyz/recoil";
import type { SizeTokens } from "@coral-xyz/tamagui";
import { ListItemIconCore, TamaguiIcons } from "@coral-xyz/tamagui";

import { gql } from "../../apollo";
import type { ChainId } from "../../apollo/graphql";

const wrapperStyles = (size: SizeTokens): ViewStyle => ({
  height: size,
  width: size,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const GET_TOKEN_LOGO = gql(`
  query GetTokenListEntryLogo($chainId: ChainID!, $filters: TokenListEntryFiltersInput) {
    tokenList(chainId: $chainId, filters: $filters) {
      id
      logo
    }
  }
`);

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
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery_experimental(GET_TOKEN_LOGO, {
    variables: {
      chainId: activeWallet.blockchain.toUpperCase() as ChainId,
      filters: {
        symbols,
      },
    },
  });

  return (
    <View
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      <ListItemIconCore
        style={{ marginRight: 10, marginBottom: 15 }}
        radius={12}
        size={24}
        image={data.tokenList[0]?.logo ?? UNKNOWN_ICON_SRC}
      />
      <ListItemIconCore
        style={{ marginLeft: -15, zIndex: 10 }}
        radius={12}
        size={24}
        image={data.tokenList[1]?.logo ?? UNKNOWN_ICON_SRC}
      />
    </View>
  );
};

export const TransactionListItemIconTransfer = ({
  size,
  symbol,
}: TransactionListItemIconTypeProps & { symbol: string }) => {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery_experimental(GET_TOKEN_LOGO, {
    variables: {
      chainId: activeWallet.blockchain.toUpperCase() as ChainId,
      filters: {
        symbols: [symbol],
      },
    },
  });

  return (
    <View style={wrapperStyles(size)}>
      <ListItemIconCore
        size={size}
        radius={22}
        image={data.tokenList[0]?.logo ?? UNKNOWN_ICON_SRC}
      />
    </View>
  );
};
