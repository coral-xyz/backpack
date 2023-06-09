import { StyleSheet, View } from "react-native";
import { useSuspenseQuery_experimental } from "@apollo/client";
import { UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import { UNKNOWN_ICON_SRC, useActiveWallet } from "@coral-xyz/recoil";
import type { SizeTokens } from "@coral-xyz/tamagui";
import { ListItemIconCore, TamaguiIcons } from "@coral-xyz/tamagui";

import { gql } from "../../apollo";
import type { ChainId } from "../../apollo/graphql";

const GET_TOKEN_LOGO = gql(`
  query GetTokenListEntryLogo($chainId: ChainID!, $filters: TokenListEntryFiltersInput) {
    tokenList(chainId: $chainId, filters: $filters) {
      id
      logo
    }
  }
`);

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
  size: SizeTokens;
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
    <TamaguiIcons.Flame color="$negative" size={size} />
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
    <TamaguiIcons.Check color="$positive" size={size} />
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
    <TamaguiIcons.X color="$negative" size={size} />
  </View>
);

export const TransactionListItemIconNft = ({
  mint,
  size,
}: TransactionListItemIconTypeProps & { mint?: string }) => (
  <ListItemIconCore
    image={
      mint
        ? `https://swr.xnfts.dev/nft-data/metaplex-nft/${mint}/image`
        : UNKNOWN_NFT_ICON_SRC
    }
    radius={8}
    size={size}
  />
);

export const TransactionListItemIconSwap = ({
  containerSize,
  size,
  symbols,
}: TransactionListItemIconTypeProps & {
  containerSize?: SizeTokens;
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
      style={[
        styles.swapContainer,
        { width: containerSize, height: containerSize },
      ]}
    >
      <ListItemIconCore
        style={{ marginRight: 10, marginBottom: 15 }}
        radius="$circular"
        size={size}
        image={data.tokenList[0]?.logo ?? UNKNOWN_ICON_SRC}
      />
      <ListItemIconCore
        style={{ marginLeft: -15, zIndex: 10 }}
        radius="$circular"
        size={size}
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
    <ListItemIconCore
      size={size}
      radius="$circular"
      image={data.tokenList[0]?.logo ?? UNKNOWN_ICON_SRC}
    />
  );
};
