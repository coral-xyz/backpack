import { useCallback } from "react";
import {
  SectionList,
  type SectionListData,
  type SectionListRenderItem,
} from "react-native";
import {
  ListHeaderCore,
  ListSectionSeparatorCore,
  RoundedContainerGroup,
  Separator,
} from "@coral-xyz/tamagui";

import type { ChainId, Transaction } from "../../apollo/graphql";

import { TransactionListItem } from "./TransactionListItem";
import type { TransactionGroup } from "./utils";

export type TransactionListProps = {
  blockchain: ChainId;
  onItemClick?: (
    transaction: Partial<Transaction>,
    explorerUrl: string
  ) => void;
  transactions: TransactionGroup[];
};

export function TransactionList({
  blockchain,
  onItemClick,
  transactions,
}: TransactionListProps) {
  /**
   * Returns the child component key for an item.
   * @param {Partial<Transaction>} item
   * @returns {string}
   */
  const keyExtractor = useCallback(
    (item: Partial<Transaction>) => item.id!,
    []
  );

  /**
   * Returns a renderable component for an individual item in a list.
   * @param {{ item: Partial<Transaction>, section: SectionListData<Partial<Transaction>, TransactionGroup>, index: number }} args
   * @returns {ReactElement}
   */
  const renderItem: SectionListRenderItem<
    Partial<Transaction>,
    TransactionGroup
  > = useCallback(
    ({ item, section, index }) => {
      const first = index === 0;
      const last = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          disableBottomRadius={!last}
          disableTopRadius={!first}
          style={{ marginBottom: last ? 24 : undefined }}
        >
          <TransactionListItem
            blockchain={blockchain}
            transaction={item}
            onClick={onItemClick}
          />
        </RoundedContainerGroup>
      );
    },
    [blockchain, onItemClick]
  );

  /**
   * Returns a renderable component for the header of the each section.
   * @param {{ section: SectionListData<Partial<Transaction>, TransactionGroup> }} info
   * @returns {ReactElement}
   */
  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<Partial<Transaction>, TransactionGroup>;
    }) => <ListHeaderCore style={{ marginBottom: 0 }} title={section.date} />,
    []
  );

  return (
    <SectionList
      style={{ marginHorizontal: 16, marginTop: 16 }}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      sections={transactions}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      SectionSeparatorComponent={ListSectionSeparatorCore}
      ItemSeparatorComponent={Separator}
    />
  );
}
