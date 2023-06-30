import { Suspense, useCallback } from "react";
import { SectionListProps } from "react-native";

import { useSuspenseQuery } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";
import { ErrorBoundary } from "react-error-boundary";

import { SectionSeparator } from "~components/ListItem";
import { NoRecentActivity } from "~components/RecentActivityList";
import {
  ListItem,
  type ListItemProps,
} from "~components/RecentActivityListItem";
import {
  RoundedContainerGroup,
  ScreenError,
  ScreenLoading,
} from "~components/index";
import { convertTransactionDataToSectionList } from "~lib/RecentActivityUtils";
import { RecentActivityScreenProps } from "~navigation/types";

import {
  PaddedSectionList,
  SectionHeader,
} from "~src/components/PaddedFlatList";
import { gql } from "~src/graphql/__generated__";
import { ProviderId } from "~src/graphql/__generated__/graphql";

const QUERY_RECENT_TRANSACTIONS = gql(`
  query WalletTransactions($address: String!, $providerId: ProviderID!, $filters: TransactionFiltersInput) {
    tokenList(providerId: $providerId) {
      ...TokenEntryFragment
    }
    wallet(providerId: $providerId, address: $address) {
      id
      transactions(filters: $filters) {
        edges {
          node {
            ...TransactionFragment
          }
        }
      }
    }
  }
`);

type TransactionListProps = SectionListProps<any> & {
  providerId: ProviderId;
  address: string;
  tokenMint?: string;
};

export function TransactionSectionList({
  providerId,
  address,
  tokenMint,
  ...props
}: TransactionListProps) {
  const navigation = useNavigation();
  const { data } = useSuspenseQuery(QUERY_RECENT_TRANSACTIONS, {
    variables: {
      providerId,
      address,
      filters: {
        token: tokenMint,
      },
    },
  });

  const handlePressItem = useCallback(
    (item: ListItemProps) => {
      navigation.push("RecentActivityDetail", {
        id: item.id,
        title: item.title,
      });
    },
    [navigation]
  );

  const getTokenUrl = useCallback(
    (symbol: string) => {
      const tokenMap = new Map(
        (data.tokenList ?? []).map((token) => [token.symbol, token])
      );
      return tokenMap.get(symbol);
    },
    [data.tokenList]
  );

  const keyExtractor = (item: ListItemProps) => item.id;
  const renderItem = useCallback(
    ({ item, section, index }: { item: ListItemProps; index: number }) => {
      const isFirst = index === 0;
      const isLast = index === section.data.length - 1;

      // there's a weird glitch that prevents the border from showing up properly when more than 1 item
      const borderRadius = section.data.length > 1 ? 24 : 16;

      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
          borderRadius={borderRadius}
        >
          <ListItem
            item={item}
            getTokenUrl={getTokenUrl}
            onPress={() => handlePressItem(item)}
          />
        </RoundedContainerGroup>
      );
    },
    [getTokenUrl, handlePressItem]
  );

  const renderSectionHeader = useCallback(({ section }: any) => {
    return <SectionHeader title={section.title} />;
  }, []);

  const sections = convertTransactionDataToSectionList(
    data?.wallet?.transactions?.edges ?? []
  );

  return (
    <PaddedSectionList
      sections={sections}
      ListEmptyComponent={NoRecentActivity}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      renderSectionFooter={SectionSeparator}
      {...props}
    />
  );
}

function Container({ navigation }: RecentActivityScreenProps): JSX.Element {
  const activeWallet = useActiveWallet();

  return (
    <TransactionSectionList
      providerId={activeWallet.blockchain.toUpperCase() as ProviderId}
      address={activeWallet.publicKey}
      navigation={navigation}
    />
  );
}

export function RecentActivityScreen({
  navigation,
  route,
}: RecentActivityScreenProps): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
