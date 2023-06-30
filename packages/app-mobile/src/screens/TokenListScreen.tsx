import type { Blockchain } from "@coral-xyz/common";
import type { Token, NavTokenOptions } from "~types/types";

import { Suspense, useCallback } from "react";

import { useSuspenseQuery } from "@apollo/client";
import { blockchainBalancesSorted } from "@coral-xyz/recoil";
import { Stack, StyledText } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";
import { useRecoilValue } from "recoil";

import { TransferWidget } from "~components/Unlocked/Balances/TransferWidget";
import { RoundedContainerGroup, ScreenError } from "~components/index";
import { TokenListScreenProps } from "~navigation/types";
import { BalanceSummaryWidget } from "~screens/Unlocked/components/BalanceSummaryWidget";
import { TokenRow } from "~screens/Unlocked/components/Balances";

import { ScreenListLoading } from "~src/components/LoadingStates";
import { PaddedFlatList } from "~src/components/PaddedFlatList";
import { gql } from "~src/graphql/__generated__";
import { ProviderId } from "~src/graphql/__generated__/graphql";
import { useSession } from "~src/lib/SessionProvider";

const QUERY_TOKEN_BALANCES = gql(`
  query GetTokenBalances($address: String!, $providerId: ProviderID!) {
    wallet(address: $address, providerId: $providerId) {
      id
      balances {
        id
        tokens {
          edges {
            node {
              id
              address
              displayAmount
            marketData {
              id
              percentChange
              value
            }
              token
              tokenListEntry {
                id
                logo
                name
                symbol
              }
            }
          }
        }
      }
    }
  }
`);

function Container({ navigation, route }: TokenListScreenProps): JSX.Element {
  const { activeWallet } = useSession();
  const { blockchain, publicKey } = route.params;
  const { data } = useSuspenseQuery(QUERY_TOKEN_BALANCES, {
    variables: {
      address: "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz",
      providerId: "SOLANA",
    },
  });

  const balances = useRecoilValue(
    blockchainBalancesSorted({
      blockchain: (activeWallet?.blockchain as Blockchain) || blockchain,
      publicKey: activeWallet?.publicKey || publicKey,
    })
  );

  const onPressToken = useCallback(
    (blockchain: Blockchain, token: Token) => {
      navigation.push("TokenDetail", {
        blockchain,
        tokenMint: token.mint,
      });
    },
    [navigation]
  );

  const keyExtractor = (item) => item.address;
  const renderItem = useCallback(
    ({ item, index }: { item: Token; index: number }) => {
      const isFirst = index === 0;
      const isLast = index === balances.length - 1;

      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
          borderRadius={16}
        >
          <TokenRow
            balance={item}
            // onPressRow={onPressToken}
            // blockchain={blockchain}
            // token={token}
            // walletPublicKey={publicKey}
          />
        </RoundedContainerGroup>
      );
    },
    [balances.length, onPressToken, blockchain, publicKey]
  );

  const ListHeader = (
    <>
      <BalanceSummaryWidget hideChange />
      <Stack mt={18} mb={24}>
        <TransferWidget
          swapEnabled
          rampEnabled={false}
          onPressOption={(route: string, options: NavTokenOptions) => {
            navigation.push(route, options);
          }}
        />
      </Stack>
    </>
  );

  const items = data?.wallet?.balances?.tokens?.edges.map((e) => e.node) ?? [];

  return (
    <PaddedFlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
    />
  );
}

export function TokenListScreen({
  navigation,
  route,
}: TokenListScreenProps): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenListLoading style={{ marginTop: 164 }} />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
