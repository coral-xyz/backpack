import type { Blockchain } from "@coral-xyz/common";
import type { Wallet, PublicKey } from "~types/types";

import { Suspense, useCallback } from "react";
import { FlatList, Pressable } from "react-native";

import { gql, useSuspenseQuery_experimental } from "@apollo/client";
import { formatUsd } from "@coral-xyz/common";
import { Box, StyledText, XStack, BlockchainLogo } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { Screen, ScreenError, ScreenLoading } from "~components/index";
import { useWallets } from "~hooks/wallets";
import type { HomeWalletListScreenProps } from "~navigation/WalletsNavigator";
import { BalanceSummaryWidget } from "~screens/Unlocked/components/BalanceSummaryWidget";

import { useSession } from "~src/lib/SessionProvider";

function ListItemWalletCard({
  isFirst,
  name,
  balance,
  publicKey,
  type,
  blockchain,
  onPress,
}: {
  isFirst: boolean;
  name: string;
  type: string;
  blockchain: Blockchain;
  publicKey: PublicKey;
  balance: string;
  onPress: (w: { blockchain: Blockchain; publicKey: PublicKey }) => void;
}) {
  const dehydrated = type === "dehydrated";
  return (
    <Pressable
      onPress={() => {
        if (!dehydrated) {
          onPress?.({ blockchain, publicKey });
        }
      }}
    >
      <XStack
        mt={isFirst ? 0 : -12}
        jc="space-between"
        p={16}
        borderTopEndRadius={12}
        borderTopStartRadius={12}
        borderWidth={1}
        borderColor="$baseBorderLight"
        backgroundColor="$card"
        height={70}
      >
        <XStack ai="center" space={4}>
          <BlockchainLogo blockchain={blockchain} size={16} />
          <StyledText ml={4} size="$lg" fontWeight="600">
            {name}
          </StyledText>
        </XStack>
        <StyledText size="$lg">{balance}</StyledText>
      </XStack>
    </Pressable>
  );
}

const QUERY_USER_WALLETS = gql`
  query UserWallets {
    user {
      id
      wallets {
        edges {
          node {
            id
            address
            isPrimary
            createdAt
            provider {
              id
              logo
              name
            }
            balances {
              id
              aggregate {
                valueChange
                value
                percentChange
                id
              }
            }
          }
        }
      }
    }
  }
`;

function coalesceWalletData(graphqlData, recoilWallets) {
  // TODO: this is a hack, we should be able to get the wallets from the query
  const wallets = graphqlData.user.wallets.edges.map((edge) => {
    const a = recoilWallets.find(
      (wallet) => wallet.publicKey === edge.node.address
    );

    return {
      ...edge.node,
      publicKey: edge.node.address,
      isPrimary: edge.node.isPrimary,
      blockchain: edge.node.provider.name.toLowerCase() as Blockchain,
      balance: formatUsd(edge.node.balances.aggregate.value),
      // TODO: this is a hack, we should be able to get the wallets from the query
      name: a?.name ?? "",
      type: a?.type ?? "",
    };
  });

  return wallets;
}

function Container({ navigation }: HomeWalletListScreenProps): JSX.Element {
  const { setActiveWallet } = useSession();
  const { data } = useSuspenseQuery_experimental(QUERY_USER_WALLETS);
  const { allWallets, selectActiveWallet } = useWallets();
  const wallets = coalesceWalletData(data, allWallets);
  console.log("debug1:wallets", wallets);

  const handlePressWallet = useCallback(
    async (w: any) => {
      const activeWallet = { blockchain: w.blockchain, publicKey: w.publicKey };
      setActiveWallet(activeWallet);
      selectActiveWallet(activeWallet);
      navigation.push("TopTabsWalletDetail", {
        // @ts-expect-error TODO(navigation) fix
        screen: "TokenList",
        params: activeWallet,
      });
    },
    [navigation, selectActiveWallet, setActiveWallet]
  );

  const keyExtractor = (wallet: Wallet) => wallet.publicKey.toString();
  const renderItem = useCallback(
    ({ item, index }) => {
      const isFirst = index === 0;
      return (
        <ListItemWalletCard
          isFirst={isFirst}
          name={item.name}
          blockchain={item.blockchain}
          publicKey={item.publicKey}
          type={item.type}
          balance={item.balance}
          onPress={handlePressWallet}
        />
      );
    },
    [handlePressWallet]
  );

  return (
    <FlatList
      style={{ paddingTop: 16, paddingHorizontal: 16 }}
      contentContainerStyle={{ paddingBottom: 32 }}
      data={wallets}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Box mb={12}>
          <BalanceSummaryWidget />
        </Box>
      }
    />
  );
}

export function HomeWalletListScreen({
  navigation,
  route,
}: HomeWalletListScreenProps): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error.message} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
