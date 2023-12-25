import { startTransition, useState, useTransition } from "react";
import { type SuspenseQueryHookFetchPolicy, useQuery } from "@apollo/client";

import { gql } from "../../apollo";
import type { GetTransactionsQuery, ProviderId } from "../../apollo/graphql";
import { usePolledSuspenseQuery, useRefreshableQuery } from "../../hooks";

export const DEFAULT_POLLING_INTERVAL_SECONDS = 120;

export const GET_TRANSACTIONS_QUERY = gql(`
  query GetTransactions($address: String!, $providerId: ProviderID!, $filters: TransactionFiltersInput) {
    wallet(address: $address, providerId: $providerId) {
      id
      provider {
        providerId
      }
      transactions(filters: $filters) {
        edges {
          cursor
          node {
            id
            address
            description
            fee
            feePayer
            error
            hash
            nfts
            provider {
              id
              providerId
            }
            source
            timestamp
            type
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`);

export function useGetTransactionsData({
  address,
  fetchPolicy,
  limit,
  pagination,
  providerId,
  tokenMint,
}: {
  address: string;
  fetchPolicy?: SuspenseQueryHookFetchPolicy;
  limit?: number;
  pagination?: boolean;
  providerId: ProviderId;
  tokenMint?: string;
}): {
  data: GetTransactionsQuery | undefined;
  loading: boolean;
  isLoadingNextPage: boolean;
  refreshing: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
} {
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const { data, fetchMore, refetch, loading } = useQuery(
    GET_TRANSACTIONS_QUERY,
    {
      fetchPolicy,
      errorPolicy: "all",
      variables: {
        address,
        providerId,
        filters: {
          limit,
          token: tokenMint,
        },
      },
    }
  );

  const { onRefresh, refreshing } = useRefreshableQuery(refetch);

  const onLoadMore = () => {
    if (pagination && data?.wallet?.transactions?.pageInfo.hasNextPage) {
      setIsLoadingNextPage(true);
      startTransition(() => {
        const edges = data?.wallet?.transactions?.edges;
        fetchMore({
          variables: {
            filters: {
              before: edges?.at(-1)?.node.hash,
              offset: edges?.length,
            },
          },
        }).finally(() => {
          setIsLoadingNextPage(false);
        });
      });
    }
  };

  return {
    data,
    refreshing,
    onLoadMore,
    loading,
    isLoadingNextPage,
    onRefresh,
  };
}

export function useGetSuspenseTransactionsData({
  address,
  fetchPolicy,
  limit,
  pagination,
  pollingIntervalSeconds,
  providerId,
  tokenMint,
}: {
  address: string;
  fetchPolicy?: SuspenseQueryHookFetchPolicy;
  limit?: number;
  pagination?: boolean;
  pollingIntervalSeconds?: number | "disabled";
  providerId: ProviderId;
  tokenMint?: string;
}): {
  data: GetTransactionsQuery | undefined;
  refreshing: boolean;
  isPending: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
} {
  const [isPending, startTransition] = useTransition();
  const { data, fetchMore, refetch } = usePolledSuspenseQuery(
    pollingIntervalSeconds ?? DEFAULT_POLLING_INTERVAL_SECONDS,
    GET_TRANSACTIONS_QUERY,
    {
      fetchPolicy,
      errorPolicy: "all",
      variables: {
        address,
        providerId,
        filters: {
          limit,
          token: tokenMint,
        },
      },
    }
  );

  const { onRefresh, refreshing } = useRefreshableQuery(refetch);

  const onLoadMore = () => {
    if (pagination && data?.wallet?.transactions?.pageInfo.hasNextPage) {
      startTransition(() => {
        const edges = data?.wallet?.transactions?.edges;
        fetchMore({
          variables: {
            filters: {
              before: edges?.at(-1)?.node.hash,
              offset: edges?.length,
            },
          },
        });
      });
    }
  };

  return {
    data,
    refreshing,
    onLoadMore,
    isPending,
    onRefresh,
  };
}
