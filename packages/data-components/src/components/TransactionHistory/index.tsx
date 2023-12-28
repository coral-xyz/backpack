import { Suspense, useMemo } from "react";
import type { SectionList, SectionListProps } from "react-native";
import { Platform } from "react-native";
import type { NonEmptyArray } from "@coral-xyz/common";

import type { WalletAddressesInput } from "../../apollo/graphql";
import type { DataComponentScreenProps } from "../common";

import { TransactionsProvider } from "./context";
import { GET_TRANSACTIONS_QUERY, useGetSuspenseTransactionsData } from "./data";
import type { ParseTransactionDetails } from "./parsing";
import { TransactionList } from "./TransactionList";
import { getGroupedTransactions, type ResponseTransaction } from "./utils";

export { GET_TRANSACTIONS_QUERY };
export type { ParseTransactionDetails, ResponseTransaction };
export { parseTransaction } from "./parsing";
export * from "./TransactionDetails";

export type TransactionHistoryProps = DataComponentScreenProps & {
  addresses: NonEmptyArray<WalletAddressesInput>;
  limit?: number;
  loadingMoreSkeletonComponent?: SectionListProps<ResponseTransaction>["ListFooterComponent"];
  onItemClick?: (
    transaction: ResponseTransaction,
    explorerUrl: string,
    parsedDetails: ParseTransactionDetails | null
  ) => void;
  pagination?: boolean;
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
  addresses,
  emptyStateComponent,
  fetchPolicy,
  limit,
  loadingMoreSkeletonComponent,
  pagination,
  pollingIntervalSeconds,
  tokenMint,
  ListComponent,
  ListHeaderComponent,
}: Omit<
  TransactionHistoryProps,
  "aggregate" | "loaderComponent" | "onItemClick"
>) {
  if (addresses.length > 1 || addresses[0].pubkeys.length !== 1) {
    throw new Error(
      "must provide exactly one provider ID and public key pair for <TransactionHistory />"
    );
  }

  const {
    providerId,
    pubkeys: [address],
  } = addresses[0];

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
      transactions={groupedTransactions}
      ListComponent={ListComponent}
      ListFooterComponent={isPending ? loadingMoreSkeletonComponent : undefined}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
}
