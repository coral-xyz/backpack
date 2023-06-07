import { type ReactNode, Suspense, useMemo } from "react";
import { useActiveWallet } from "@coral-xyz/recoil";

import { gql } from "../../apollo";
import { type GetTransactionsQuery, ProviderId } from "../../apollo/graphql";
import { usePolledSuspenseQuery } from "../../hooks";

import type { ParseTransactionDetails } from "./parsing";
import { TransactionList } from "./TransactionList";
import { getGroupedTransactions } from "./utils";

export type { ParseTransactionDetails } from "./parsing";
export * from "./TransactionDetails";

const DEFAULT_POLLING_INTERVAL = 60000;

const GET_TRANSACTIONS = gql(`
  query GetTransactions($address: String!, $filters: TransactionFiltersInput) {
    user {
      id
      wallet(address: $address) {
        id
        provider {
          providerId
        }
        transactions(filters: $filters) {
          edges {
            node {
              id
              description
              fee
              feePayer
              error
              hash
              nfts
              source
              timestamp
              type
            }
          }
        }
      }
    }
  }
`);

export type ResponseTransaction = NonNullable<
  NonNullable<
    NonNullable<GetTransactionsQuery["user"]>["wallet"]
  >["transactions"]
>["edges"][number]["node"];

export type TransactionHistoryProps = {
  contractOrMint?: string;
  loaderComponent?: ReactNode;
  onItemClick?: (
    transaction: ResponseTransaction,
    explorerUrl: string,
    parsedDetails: ParseTransactionDetails | null
  ) => void;
  pollingInterval?: number;
};

export const TransactionHistory = ({
  loaderComponent,
  ...rest
}: TransactionHistoryProps) => (
  <Suspense fallback={loaderComponent}>
    <_TransactionHistory {...rest} />
  </Suspense>
);

function _TransactionHistory({
  contractOrMint,
  onItemClick,
  pollingInterval,
}: Omit<TransactionHistoryProps, "loaderComponent">) {
  const activeWallet = useActiveWallet();
  const { data } = usePolledSuspenseQuery(
    pollingInterval ?? DEFAULT_POLLING_INTERVAL,
    GET_TRANSACTIONS,
    {
      variables: {
        address: activeWallet.publicKey,
        filters: {
          token: contractOrMint,
        },
      },
    }
  );

  /**
   * Memoized value for the data received wallet object.
   */
  const wallet = useMemo(() => data.user?.wallet, [data.user]);

  /**
   * Memoized value for the transactions list that is grouped by date.
   */
  const groupedTransactions = useMemo(
    () =>
      getGroupedTransactions(
        wallet?.transactions?.edges.map((e) => e.node) ?? []
      ),
    [wallet]
  );

  return (
    <TransactionList
      blockchain={wallet?.provider.providerId ?? ProviderId.Solana}
      onItemClick={onItemClick}
      transactions={groupedTransactions}
    />
  );
}
