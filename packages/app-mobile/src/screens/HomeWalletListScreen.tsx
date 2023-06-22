import type { Blockchain } from "@coral-xyz/common";
import type { Wallet, PublicKey } from "~types/types";

import { Suspense, useCallback } from "react";
import { FlatList, Pressable } from "react-native";

import Constants from "expo-constants";

import { useSuspenseQuery } from "@apollo/client";
import { Stack, StyledText, XStack, BlockchainLogo } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenError } from "~components/index";
import { useWallets } from "~hooks/wallets";
import type { HomeWalletListScreenProps } from "~navigation/WalletsNavigator";
import { BalanceSummaryWidget } from "~screens/Unlocked/components/BalanceSummaryWidget";

import { ScreenListLoading } from "~src/components/LoadingStates";
import { gql } from "~src/graphql/__generated__";
import { useSession } from "~src/lib/SessionProvider";
import { coalesceWalletData } from "~src/lib/WalletUtils";

function ListItemWalletCard({
  isFirst,
  name,
  type,
  publicKey,
  blockchain,
  isCold,
  balance,
  onPress,
}: {
  isFirst: boolean;
  name: string;
  type: string;
  publicKey: PublicKey;
  blockchain: Blockchain;
  isCold: boolean;
  balance: string;
  onPress: (w: Wallet) => void;
}) {
  const dehydrated = type === "dehydrated";
  return (
    <Pressable
      onPress={() => {
        if (!dehydrated) {
          onPress({ name, type, publicKey, blockchain, isCold });
        }
      }}
    >
      <XStack
        mt={isFirst ? 0 : -12}
        jc="space-between"
        p={16}
        borderRadius={12}
        borderWidth={1}
        borderColor="$baseBorderLight"
        backgroundColor="$card"
        height={70}
      >
        <XStack ai="center" space={4}>
          <BlockchainLogo blockchain={blockchain} size={16} />
          <StyledText ml={8} size="$lg" fontWeight="600">
            {name}
          </StyledText>
        </XStack>
        <StyledText size="$lg">{balance}</StyledText>
      </XStack>
    </Pressable>
  );
}

const QUERY_USER_WALLETS = gql(`
  query HomeUserWallets {
    user {
      id
      wallets {
        edges {
          node {
            ...WalletFragment
          }
        }
      }
    }
  }
`);

function Container({ navigation }: HomeWalletListScreenProps): JSX.Element {
  const { setActiveWallet } = useSession();
  const { data } = useSuspenseQuery(QUERY_USER_WALLETS);
  const { allWallets } = useWallets();
  const wallets = coalesceWalletData(data, allWallets);
  const insets = useSafeAreaInsets();

  const handlePressWallet = useCallback(
    async (wallet: Wallet) => {
      setActiveWallet(wallet);
      navigation.push("TopTabsWalletDetail", {
        // @ts-expect-error TODO(navigation) fix
        screen: "TokenList",
        params: wallet,
      });
    },
    [navigation, setActiveWallet]
  );

  const keyExtractor = (wallet: Wallet) => wallet.publicKey.toString();
  const renderItem = useCallback(
    ({ item, index }) => {
      const isFirst = index === 0;
      return (
        <ListItemWalletCard
          name={item.name}
          type={item.type}
          publicKey={item.publicKey}
          blockchain={item.blockchain}
          isCold={item.isCold}
          isFirst={isFirst}
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
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      data={wallets}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Stack mb={12}>
          <BalanceSummaryWidget />
        </Stack>
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
      fallbackRender={({ error }) => (
        <ScreenError
          error={error.message}
          extra={Constants.expoConfig?.extra?.graphqlApiUrl}
        />
      )}
    >
      <Suspense fallback={<ScreenListLoading style={{ marginTop: 100 }} />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}

// <Container navigation={navigation} route={route} />
