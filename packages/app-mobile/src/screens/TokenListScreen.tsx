import type { NavTokenOptions } from "~types/types";

import { Suspense, useCallback, useMemo } from "react";
import { ListRenderItem } from "react-native";

import { useSuspenseQuery } from "@apollo/client";
import { formatWalletAddress } from "@coral-xyz/common";
import { Stack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { TransferWidget } from "~components/Unlocked/Balances/TransferWidget";
import { RoundedContainerGroup, ScreenError } from "~components/index";
import { TokenListScreenProps } from "~navigation/types";
import { ListItemTokenBalance } from "~screens/Unlocked/components/Balances";

import { BalanceSummaryWidget } from "~src/components/BalanceSummaryWidget";
import { ScreenListLoading } from "~src/components/LoadingStates";
import { PaddedFlatList } from "~src/components/PaddedFlatList";
import { gql } from "~src/graphql/__generated__";
import {
  GetTokenBalancesQuery,
  ProviderId,
} from "~src/graphql/__generated__/graphql";
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
              ...TokenBalanceFragment
            }
          }
        }
      }
    }
  }
`);

export type ResponseTokenBalance = NonNullable<
  NonNullable<
    NonNullable<NonNullable<GetTokenBalancesQuery["wallet"]>>["balances"]
  >["tokens"]
>["edges"][number]["node"];

function Container({ navigation }: TokenListScreenProps): JSX.Element {
  const { activeWallet } = useSession();

  const providerId = activeWallet?.blockchain.toUpperCase() as ProviderId;
  const address = activeWallet?.publicKey as string;
  const { data } = useSuspenseQuery(QUERY_TOKEN_BALANCES, {
    variables: {
      address,
      providerId,
    },
  });

  const balances = useMemo(
    () => data.wallet?.balances?.tokens?.edges.map((e) => e.node) ?? [],
    [data]
  );

  const onPressToken = useCallback(
    (balance: ResponseTokenBalance) => {
      const title =
        balance.tokenListEntry?.name ?? formatWalletAddress(balance.token);
      navigation.push("TokenDetail", {
        address,
        providerId,
        tokenMint: balance.token,
        title,
      });
    },
    [navigation, address, providerId]
  );

  const keyExtractor = (item: ResponseTokenBalance) => item.id;
  const renderItem: ListRenderItem<ResponseTokenBalance> = useCallback(
    ({ item, index }) => {
      const isFirst = index === 0;
      const isLast = index === balances.length - 1;

      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
          borderRadius={16}
        >
          <ListItemTokenBalance balance={item} onPressRow={onPressToken} />
        </RoundedContainerGroup>
      );
    },
    [balances.length, onPressToken]
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

  return (
    <PaddedFlatList
      data={balances}
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
