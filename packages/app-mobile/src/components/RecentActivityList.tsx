import { Suspense, useCallback } from "react";
import { StyleProp, Text, ViewStyle, SectionList } from "react-native";

import * as Linking from "expo-linking";

import { Blockchain, RecentTransaction, XNFT_GG_LINK } from "@coral-xyz/common";
import { useRecentTransactionsGroupedByDate } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { ErrorBoundary } from "react-error-boundary";

import { SectionHeader, SectionSeparator } from "~components/ListItem";
import { ListItem, ListItemProps } from "~components/RecentActivityListItem";
import {
  EmptyState,
  RoundedContainerGroup,
  FullScreenLoading,
} from "~components/index";

export function NoRecentActivity({
  title,
  subtitle,
  buttonText,
}: {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}): JSX.Element {
  return (
    <EmptyState
      icon={(props: any) => <MaterialIcons name="bolt" {...props} />}
      title={title || "No Recent Activity"}
      subtitle={subtitle || "Get started by adding your first xNFT"}
      buttonText={buttonText || "Browse the xNFT Library"}
      onPress={() => {
        Linking.openURL(XNFT_GG_LINK);
      }}
    />
  );
}

export function RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions,
  minimize = false,
  style,
}: {
  blockchain: Blockchain;
  address: string;
  contractAddresses: string[] | undefined;
  transactions?: RecentTransaction[];
  minimize?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<FullScreenLoading />}>
        <_RecentActivityList
          blockchain={blockchain}
          address={address}
          contractAddresses={contractAddresses}
          transactions={transactions}
          minimize={minimize}
          style={style}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

export function _RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions: _transactions,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: string[] | undefined;
  transactions?: RecentTransaction[];
  minimize?: boolean;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  const sections = useRecentTransactionsGroupedByDate({
    blockchain: blockchain!,
    address: address!,
    contractAddresses: contractAddresses!,
    transactions: _transactions,
  });

  const keyExtractor = (item) => item.signature;
  const renderItem = useCallback(
    ({ item, section, index }: { item: ListItemProps }) => {
      const isFirst = index === 0;
      const isLast = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <ListItem
            item={{
              ...item,
              // TODO(peter) new api is cross-chain and uses hash
              hash: item.signature,
            }}
          />
        </RoundedContainerGroup>
      );
    },
    []
  );

  const renderSectionHeader = useCallback(({ section }: any) => {
    return <SectionHeader title={section.title} />;
  }, []);

  return (
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
  );
}
