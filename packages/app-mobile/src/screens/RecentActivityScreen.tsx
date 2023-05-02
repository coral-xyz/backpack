import { Suspense, useCallback } from "react";
import { Text, ActivityIndicator, SectionList } from "react-native";

import { gql, useSuspenseQuery_experimental } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
import { ErrorBoundary } from "react-error-boundary";

import { SectionHeader, SectionSeparator } from "~components/ListItem";
import { NoRecentActivity } from "~components/RecentActivityList";
import {
  ListItem,
  type ListItemProps,
} from "~components/RecentActivityListItem";
import {
  Screen,
  RoundedContainerGroup,
  FullScreenLoading,
} from "~components/index";
import { convertTransactionDataToSectionList } from "~lib/RecentActivityUtils";

const GET_RECENT_TRANSACTIONS = gql`
  query WalletTransactions($chainId: ChainID!, $address: String!) {
    wallet(chainId: $chainId, address: $address) {
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
`;

function Container({ navigation }: any): JSX.Element {
  const activeWallet = useActiveWallet();
  const { data } = useSuspenseQuery_experimental(GET_RECENT_TRANSACTIONS, {
    variables: {
      chainId: activeWallet.blockchain.toUpperCase(),
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
    data?.wallet?.transactions.edges
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
    <Screen>
      <SectionList
        sections={sections}
        ListEmptyComponent={NoRecentActivity}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        SectionSeparatorComponent={SectionSeparator}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

export function RecentActivityScreen({ navigation }: any): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<FullScreenLoading />}>
        <Container navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}
