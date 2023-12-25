import { useCallback } from "react";
import {
  Dimensions,
  Platform,
  SectionList,
  type SectionListData,
  type SectionListProps,
  type SectionListRenderItem,
  StyleSheet,
} from "react-native";
import {
  ListHeaderCore,
  ListSectionSeparatorCore,
  RoundedContainerGroup,
  YStack,
} from "@coral-xyz/tamagui";

import type { DataComponentScreenProps } from "../common";
import { themedRefreshControl } from "../themedRefreshControl";

import { TransactionListItem } from "./TransactionListItem";
import type { ResponseTransaction, TransactionGroup } from "./utils";

export type TransactionListProps = {
  emptyStateComponent?: DataComponentScreenProps["emptyStateComponent"];
  onLoadMore?: () => void | Promise<void>;
  onRefresh?: SectionListProps<ResponseTransaction>["onRefresh"];
  refreshing?: SectionListProps<ResponseTransaction>["refreshing"];
  transactions: TransactionGroup[];
  ListComponent?: typeof SectionList;
  ListFooterComponent?: SectionListProps<ResponseTransaction>["ListFooterComponent"];
  ListHeaderComponent?: SectionListProps<ResponseTransaction>["ListHeaderComponent"];
};

const SECTION_HEADER_HEIGHT = 20;

/**
 * Returns the child component key for an item.
 * @param {ResponseTransaction} item
 * @returns {string}
 */
const keyExtractor = (item: ResponseTransaction): string => item.id;

export function TransactionList({
  ListFooterComponent,
  ListHeaderComponent,
  emptyStateComponent,
  onLoadMore,
  onRefresh,
  refreshing,
  transactions,
  ListComponent = SectionList,
}: TransactionListProps) {
  /**
   * Returns a renderable component for an individual item in a list.
   * @param {{ item: ResponseTransaction, section: SectionListData<ResponseTransaction, TransactionGroup>, index: number }} args
   * @returns {ReactElement}
   */
  const renderItem: SectionListRenderItem<
    ResponseTransaction,
    TransactionGroup
  > = useCallback(({ item, section, index }) => {
    const first = index === 0;
    const last = index === section.data.length - 1;

    return (
      <RoundedContainerGroup
        disableTopRadius={!first}
        disableBottomRadius={!last}
      >
        <TransactionListItem
          blockchain={item.provider.providerId}
          transaction={item}
        />
      </RoundedContainerGroup>
    );
  }, []);

  /**
   * Returns a renderable component for the header of the each section.
   * @param {{ section: SectionListData<ResponseTransaction, TransactionGroup> }} info
   * @returns {ReactElement}
   */
  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<ResponseTransaction, TransactionGroup>;
    }) => (
      <ListHeaderCore
        style={{
          marginBottom: 0,
          marginTop: 16,
          height: SECTION_HEADER_HEIGHT,
        }}
        title={section.date}
      />
    ),
    []
  );

  return (
    <YStack position="absolute" height="100%" width="100%">
      <ListComponent
        removeClippedSubviews
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        style={styles.container}
        windowSize={Platform.select({ native: 5, web: 10 })}
        maxToRenderPerBatch={Platform.select({ native: 20, web: 30 })}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        onRefresh={onRefresh}
        refreshing={refreshing}
        sections={transactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{
          flex: 1,
        }}
        renderSectionHeader={renderSectionHeader}
        SectionSeparatorComponent={ListSectionSeparatorCore}
        ListEmptyComponent={emptyStateComponent}
        ListFooterComponent={ListFooterComponent}
        ListHeaderComponent={ListHeaderComponent}
        {...themedRefreshControl({ refreshing, onRefresh })}
      />
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      native: {
        height: Dimensions.get("window").height,
      },
      web: {
        height: "100%",
        marginHorizontal: 16,
      },
    }),
  },
});
