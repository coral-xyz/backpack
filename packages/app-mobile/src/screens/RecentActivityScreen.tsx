import { Suspense, useCallback } from "react";
import { View } from "react-native";

import { useSuspenseQuery } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
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

const GET_RECENT_TRANSACTIONS = gql(`
  query WalletTransactions($providerId: ProviderID!, $address: String!) {
    wallet(providerId: $providerId, address: $address) {
      id
      transactions {
        edges {
          node {
            id
            description
            block
            fee
            feePayer
            hash
            source
            type
            timestamp
          }
        }
      }
    }
  }
`);

function Container({ navigation }: RecentActivityScreenProps): JSX.Element {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery(GET_RECENT_TRANSACTIONS, {
    variables: {
      // @ts-expect-error
      providerId: activeWallet.blockchain.toUpperCase(),
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

  const keyExtractor = (item: ListItemProps) => item.id;
  const renderItem = useCallback(
    ({ item, section, index }: { item: ListItemProps }) => {
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
          <ListItem item={item} handlePress={handlePressItem} />
        </RoundedContainerGroup>
      );
    },
    [handlePressItem]
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
