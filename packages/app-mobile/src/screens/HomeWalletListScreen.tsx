import type { Wallet, PublicKey } from "~types/types";

import { Suspense, useCallback } from "react";
import { Pressable } from "react-native";

import Constants from "expo-constants";
import { Image } from "expo-image";

import { useSuspenseQuery } from "@apollo/client";
import { Blockchain } from "@coral-xyz/common";
import { Stack, StyledText, XStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenError } from "~components/index";
import { useWallets } from "~hooks/wallets";
import type { HomeWalletListScreenProps } from "~navigation/WalletsNavigator";

import Images from "~src/Images";
import { BalanceSummaryWidget } from "~src/components/BalanceSummaryWidget";
import { ScreenListLoading } from "~src/components/LoadingStates";
import { PaddedFlatList } from "~src/components/PaddedFlatList";
import { gql } from "~src/graphql/__generated__";
import { useSession } from "~src/lib/SessionProvider";
import { coalesceWalletData } from "~src/lib/WalletUtils";

function getBlockchainLogo(blockchain: Blockchain) {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return Images.walletListEthereum;
    case Blockchain.SOLANA:
      return Images.walletListSolana;
    default:
      return Images.walletListSolana;
  }
}

function BlockchainLogo({
  size = 24,
  blockchain,
}: {
  size?: number;
  blockchain: Blockchain;
}) {
  const source = getBlockchainLogo(blockchain);
  return <Image source={source} style={{ width: size, height: size }} />;
}

function ListItemWalletCard({
  name,
  type,
  publicKey,
  blockchain,
  balance,
  onPress,
  isPrimary,
  isCold,
  isFirst,
  isLast,
}: {
  name: string;
  type: string;
  publicKey: PublicKey;
  blockchain: Blockchain;
  balance: string;
  onPress: (w: Wallet) => void;
  isPrimary: boolean;
  isCold: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const dehydrated = type === "dehydrated";
  return (
    <Pressable
      style={{
        shadowColor: "rgba(0, 0, 0, 1)",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
      onPress={() => {
        if (!dehydrated) {
          onPress({ name, type, publicKey, blockchain, isCold });
        }
      }}
    >
      <Stack
        mt={isFirst ? 0 : -20}
        jc="space-between"
        p={16}
        borderRadius={12}
        borderWidth={1}
        borderColor="$baseBorderLight"
        backgroundColor="$card"
        height={isLast ? 180 : 70}
      >
        <XStack ai="flex-start" jc="space-between">
          <XStack ai="center">
            <BlockchainLogo blockchain={blockchain} size={24} />
            <StyledText ml={8} size="$lg" fontWeight="600">
              {name}
            </StyledText>
          </XStack>
          <StyledText size="$lg">{balance}</StyledText>
        </XStack>
        {isLast && isPrimary ? (
          <XStack alignSelf="flex-end">
            <Stack br={10} ai="center" jc="center" px={12} py={4} bg="#DBEAFE">
              <StyledText fontSize="$xs" fontWeight="400" color="#1E40AF">
                Primary
              </StyledText>
            </Stack>
          </XStack>
        ) : null}
      </Stack>
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
      const isLast = index === wallets.length - 1;
      return (
        <ListItemWalletCard
          name={item.name}
          type={item.type}
          publicKey={item.publicKey}
          blockchain={item.blockchain}
          balance={item.balance}
          onPress={handlePressWallet}
          isPrimary={item.isPrimary}
          isCold={item.isCold}
          isFirst={isFirst}
          isLast={isLast}
        />
      );
    },
    [handlePressWallet, wallets.length]
  );

  return (
    <PaddedFlatList
      data={wallets}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={
        <Stack mt={12} mb={36}>
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
