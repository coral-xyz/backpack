import { type ReactElement, useCallback } from "react";
import { SectionList, type SectionListRenderItem } from "react-native";

import type { BalanceDetailsProps } from "./BalanceDetails";
import { BalancesTableRow } from "./BalancesTableRow";
import type { ResponseTokenBalance } from "./utils";

export type BalancesTableProps = {
  balances: ResponseTokenBalance[];
  footerComponent?: ReactElement;
  onItemClick?: (args: {
    id: string;
    balance: BalanceDetailsProps["balance"];
    symbol: string;
    token: string;
    tokenAccount: string;
  }) => void;
};

export function BalancesTable({
  balances,
  footerComponent,
  onItemClick,
}: BalancesTableProps) {
  /**
   * Returns the child component key for an item.
   * @param {ResponseTokenBalance} item
   * @returns {string}
   */
  const keyExtractor = useCallback((item: ResponseTokenBalance) => item.id, []);

  /**
   * Returns a renderable component for an individual item in a list.
   * @param {{ item: ResponseTokenBalance, section: SectionListData<ResponseTokenBalance, { data: ResponseTokenBalance[] }>, index: number }} args
   * @returns {ReactElement}
   */
  const renderItem: SectionListRenderItem<
    ResponseTokenBalance,
    { data: ResponseTokenBalance[] }
  > = useCallback(
    ({ item }) => <BalancesTableRow balance={item} onClick={onItemClick} />,
    [onItemClick]
  );

  return (
    <SectionList
      style={{ width: "100%" }}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      sections={[{ data: balances }]}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListFooterComponent={balances.length > 0 ? footerComponent : undefined}
    />
  );
}
