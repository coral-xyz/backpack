import { Suspense, useCallback } from "react";
import { SectionList, StyleProp, Text, ViewStyle } from "react-native";

import * as Linking from "expo-linking";

import { Blockchain, RecentTransaction, XNFT_GG_LINK } from "@coral-xyz/common";
import { useRecentTransactionsGroupedByDate } from "@coral-xyz/recoil";
import { ErrorBoundary } from "react-error-boundary";

import { SectionHeader, SectionSeparator } from "~components/ListItem";
import { ListItem, ListItemProps } from "~components/RecentActivityListItem";
import {
  FullScreenLoading,
  RoundedContainerGroup,
  ScreenEmptyList,
} from "~components/index";

export const NoRecentActivity = () => (
  <ScreenEmptyList
    title="No Recent Activity"
    subtitle="Get started by doing something!"
    iconName="bolt"
    buttonText="Browse the xNFT Library"
    onPress={() => {
      Linking.openURL(XNFT_GG_LINK);
    }}
  />
);

export function RecentActivityList({
  blockchain,
  address,
  contractAddresses,
  transactions,
  minimize = false,
  style,
  contentContainerStyle,
  ListHeaderComponent,
}: {
  blockchain: Blockchain;
  address: string;
  contractAddresses: string[] | undefined;
  transactions?: RecentTransaction[];
  minimize?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: JSX.Element;
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
          contentContainerStyle={contentContainerStyle}
          ListHeaderComponent={ListHeaderComponent}
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
  ListHeaderComponent,
  style,
  contentContainerStyle,
}: {
  blockchain?: Blockchain;
  address?: string;
  contractAddresses?: string[] | undefined;
  transactions?: RecentTransaction[];
  minimize?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: JSX.Element;
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
      keyExtractor={keyExtractor}
      style={style}
      contentContainerStyle={[
        { flex: sections.length > 0 ? undefined : 1 },
        contentContainerStyle,
      ]}
      renderItem={renderItem}
      scrollEnabled={sections.length > 0}
      renderSectionHeader={renderSectionHeader}
      SectionSeparatorComponent={SectionSeparator}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={<NoRecentActivity />}
    />
  );
}
