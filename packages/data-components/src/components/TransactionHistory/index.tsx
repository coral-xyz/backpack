import { Suspense, useMemo } from "react";
import type { SectionList, SectionListProps } from "react-native";
import { Platform } from "react-native";

import { TransactionList } from "./TransactionList";
import { TransactionsProvider } from "./context";
import { GET_TRANSACTIONS_QUERY, useGetSuspenseTransactionsData } from "./data";
import type { ParseTransactionDetails } from "./parsing";
import { getGroupedTransactions, type ResponseTransaction } from "./utils";
import type { ProviderId } from "../../apollo/graphql";
import type { DataComponentScreenProps } from "../common";

export { GET_TRANSACTIONS_QUERY };
export type { ParseTransactionDetails, ResponseTransaction };
export { parseTransaction } from "./parsing";
export * from "./TransactionDetails";

export type TransactionHistoryProps = DataComponentScreenProps & {
  address: string;
  limit?: number;
  loadingMoreSkeletonComponent?: SectionListProps<ResponseTransaction>["ListFooterComponent"];
  onItemClick?: (
    transaction: ResponseTransaction,
    explorerUrl: string,
    parsedDetails: ParseTransactionDetails | null
  ) => void;
  pagination?: boolean;
  providerId: ProviderId;
  style?: SectionListProps<ResponseTransaction>["style"];
  tokenMint?: string;
  ListComponent?: typeof SectionList | any;
  ListHeaderComponent?: SectionListProps<ResponseTransaction>["ListHeaderComponent"];
};

export const TransactionHistory = ({
  loaderComponent,
  onItemClick,
  ...rest
}: TransactionHistoryProps) => {
  return (
    <TransactionsProvider onItemClick={onItemClick}>
      <Suspense fallback={loaderComponent}>
        <_TransactionHistory {...rest} />
      </Suspense>
    </TransactionsProvider>
  );
};

function _TransactionHistory({
  address,
  emptyStateComponent,
  fetchPolicy,
  limit,
  loadingMoreSkeletonComponent,
  pagination,
  pollingIntervalSeconds,
  providerId,
  style,
  tokenMint,
  ListComponent,
  ListHeaderComponent,
}: Omit<
  TransactionHistoryProps,
  "aggregate" | "loaderComponent" | "onItemClick"
>) {
  const { data, refreshing, onLoadMore, onRefresh, isPending } =
    useGetSuspenseTransactionsData({
      fetchPolicy,
      limit,
      pollingIntervalSeconds,
      providerId,
      address,
      tokenMint,
      pagination,
    });

  /**
   * Memoized value for the transactions list that is grouped by date.
   */
  const groupedTransactions = useMemo(
    () =>
      getGroupedTransactions(
        data?.wallet?.transactions?.edges.map((e) => e.node) ?? []
      ),
    [data]
  );

  return (
    <TransactionList
      emptyStateComponent={emptyStateComponent}
      onLoadMore={pagination ? onLoadMore : undefined}
      onRefresh={Platform.select({ native: onRefresh, web: undefined })}
      refreshing={refreshing}
      style={style}
      transactions={groupedTransactions}
      ListComponent={ListComponent}
      ListFooterComponent={isPending ? loadingMoreSkeletonComponent : undefined}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
}
