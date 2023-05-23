import type { Wallet } from "~types/types";

import { Suspense, useCallback } from "react";
import { FlatList, Text, View } from "react-native";

import { gql, useSuspenseQuery_experimental } from "@apollo/client";
import { Box, StyledText } from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";
import { ErrorBoundary } from "react-error-boundary";

import { ListItemWalletOverview, ListHeader } from "~components/ListItem";
import {
  RoundedContainerGroup,
  Screen,
  ScreenLoading,
  ScreenError,
} from "~components/index";
import { useWallets } from "~hooks/wallets";
import { BalanceSummaryWidget } from "~screens/Unlocked/components/BalanceSummaryWidget";

// TOOD(peter) GET_WALLET_DATA + ListItemData is a hack until we have aggregate wallets
const GET_WALLET_DATA = gql`
  query WalletData($chainId: ChainID!, $address: String!) {
    wallet(chainId: $chainId, address: $address) {
      id
      balances {
        id
        aggregate {
          id
          percentChange
          value
          valueChange
        }
      }
    }
  }
`;

function ListItemData({ wallet, onPress }: { wallet: Wallet }): JSX.Element {
  // TODO(peter/graphql): this request needs to fetch all of the balances
  const { data } = useSuspenseQuery_experimental(GET_WALLET_DATA, {
    variables: {
      chainId: wallet.blockchain.toUpperCase(),
      address: wallet.publicKey,
    },
  });

  const balance = data.wallet.balances?.aggregate.value?.toFixed(2) ?? "0.00";
  console.log("debug2:wallet", wallet);

  return (
    <ListItemWalletOverview
      grouped
      name={wallet.name}
      blockchain={wallet.blockchain}
      publicKey={wallet.publicKey}
      balance={`$${balance}`}
      onPress={onPress}
    />
  );
}

function ListItem({
  item: wallet,
  onPress,
}: {
  item: Wallet;
  onPress: any;
}): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense>
        <ListItemData wallet={wallet} onPress={onPress} />
      </Suspense>
    </ErrorBoundary>
  );
}

function WalletList() {
  const navigation = useNavigation();
  const { allWallets, onSelectWallet } = useWallets();

  const handlePressWallet = useCallback(
    async (w: Wallet) => {
      onSelectWallet(w, console.log);
      navigation.navigate("TopTabsWalletDetail", {
        screen: "TokenList",
        params: {
          publicKey: w.publicKey.toString(),
          blockchain: w.blockchain,
        },
      });
    },
    [navigation, onSelectWallet]
  );

  const keyExtractor = (wallet: Wallet) => wallet.publicKey.toString();
  const renderItem = useCallback(
    ({ item: wallet, index }: { item: Wallet; index: number }) => {
      const isFirst = index === 0;
      const isLast = index === allWallets.length - 1;
      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <ListItem item={wallet} onPress={handlePressWallet} />
        </RoundedContainerGroup>
      );
    },
    [handlePressWallet, allWallets.length]
  );

  return (
    <View style={{ flex: 1 }}>
      <ListHeader title={`${allWallets.length.toString()} Wallets`} />
      <FlatList
        data={allWallets}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </View>
  );
}

function Container() {
  return (
    <Screen headerPadding>
      <StyledText fontSize="$xl" textAlign="center">
        All balances
      </StyledText>
      <Box my={12}>
        <BalanceSummaryWidget />
      </Box>
      <WalletList />
    </Screen>
  );
}

export function HomeWalletListScreen(): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error.message} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}
