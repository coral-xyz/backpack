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

import type { ProviderId } from "../../apollo/graphql";

import type { ResponseTransaction } from ".";
import type { ParseTransactionDetails } from "./parsing";
import { TransactionListItem } from "./TransactionListItem";
import type { TransactionGroup } from "./utils";

export type TransactionListProps = {
  blockchain: ProviderId;
  onItemClick?: (
    transaction: ResponseTransaction,
    explorerUrl: string,
    parsedDetails: ParseTransactionDetails | null
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
   * @param {ResponseTransaction} item
   * @returns {string}
   */
  const keyExtractor = useCallback((item: ResponseTransaction) => item.id!, []);

  /**
   * Returns a renderable component for an individual item in a list.
   * @param {{ item: ResponseTransaction, section: SectionListData<ResponseTransaction, TransactionGroup>, index: number }} args
   * @returns {ReactElement}
   */
  const renderItem: SectionListRenderItem<
    ResponseTransaction,
    TransactionGroup
  > = useCallback(
    ({ item, section, index }) => {
      const first = index === 0;
      const last = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          disableBottomRadius={!last}
          disableTopRadius={!first}
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
   * @param {{ section: SectionListData<ResponseTransaction, TransactionGroup> }} info
   * @returns {ReactElement}
   */
  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<ResponseTransaction, TransactionGroup>;
    }) => <ListHeaderCore style={{ marginBottom: 0 }} title={section.date} />,
    []
  );

  return (
    <SectionList
      style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 24 }}
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
