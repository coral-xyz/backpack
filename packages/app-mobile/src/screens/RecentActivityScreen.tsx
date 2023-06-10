import { Suspense, useCallback } from "react";
import { SectionList } from "react-native";

import { useSuspenseQuery_experimental } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
import { ErrorBoundary } from "react-error-boundary";

import { SectionHeader, SectionSeparator } from "~components/ListItem";
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

import { gql } from "~src/graphql/__generated__";

const QUERY_TRANSACTIONS = gql(`
  fragment TransactionFragment on Transaction {
    id
    block
    description
    fee
    feePayer
    hash
    source
    timestamp
    type
  }
  query Transactions($address: String!) {
    user {
      wallet(address: $address) {
        transactions {
          edges {
            node {
              ...TransactionFragment
            }
          }
        }
      }
    }
  }
`);

function Container({ navigation }: RecentActivityScreenProps): JSX.Element {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery_experimental(QUERY_TRANSACTIONS, {
    variables: {
      address: activeWallet.publicKey,
    },
  });

  const handlePressItem = useCallback(
    (item: ListItemProps) => {
      navigation.push("ActivityDetail", {
        id: item.id,
        title: item.title,
      });
    },
    [navigation]
  );

  const sections = convertTransactionDataToSectionList(
    data.user?.wallet?.transactions?.edges ?? []
  );

  const keyExtractor = (item: ListItemProps) => item.id;
  const renderItem = useCallback(
    ({ item, section, index }: { item: ListItemProps }) => {
      const isFirst = index === 0;
      const isLast = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <ListItem item={item} handlePress={handlePressItem} />
        </RoundedContainerGroup>
      );
    },
    [handlePressItem]
  );

  const renderSectionHeader = useCallback(({ section }: any) => {
    return <SectionHeader title={section.title} />;
  }, []);

  return (
    <SectionList
      style={{ paddingTop: 16, paddingHorizontal: 16 }}
      contentContainerStyle={{ paddingBottom: 32 }}
      sections={sections}
      ListEmptyComponent={NoRecentActivity}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      SectionSeparatorComponent={SectionSeparator}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
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
