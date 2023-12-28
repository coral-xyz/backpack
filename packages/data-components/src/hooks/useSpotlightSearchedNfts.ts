import { useMemo } from "react";
import { useActiveWallet } from "@coral-xyz/recoil";

import { gql } from "../apollo";
import type {
  GetNftSpotlightAggregateQuery,
  ProviderId,
} from "../apollo/graphql";

import { usePolledSuspenseQuery } from ".";

const QUERY_NFTS_AGGREGATE = gql(`
  query GetNftSpotlightAggregate($addresses: [WalletAddressesInput!]!) {
    walletNftAggregate(addresses: $addresses) {
      edges {
        node {
          id
          address
          attributes {
            trait
            value
          }
          collection {
            id
            address
            name
          }
          compressed
          compressionData {
            id
            creatorHash
            dataHash
            leaf
            tree
          }
          description
          image
          name
          token
        }
      }
    }
  }
`);

const DEFAULT_POLLING_INTERVAL_SECONDS = 120;

type ResponseNftNode =
  GetNftSpotlightAggregateQuery["walletNftAggregate"]["edges"][number]["node"];

export const useSpotlightSearchedNfts = (
  searchFilter: string
): ResponseNftNode[] => {
  const activeWallet = useActiveWallet();
  const { data } = usePolledSuspenseQuery(
    DEFAULT_POLLING_INTERVAL_SECONDS,
    QUERY_NFTS_AGGREGATE,
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      variables: {
        addresses: [
          {
            providerId: activeWallet.blockchain.toUpperCase() as ProviderId,
            pubkeys: [activeWallet.publicKey],
          },
        ],
      },
    }
  );

  const nfts = useMemo(
    () =>
      data?.walletNftAggregate.edges.reduce<ResponseNftNode[]>((acc, curr) => {
        const includesFilter = curr.node.name
          ?.toLowerCase()
          ?.includes(searchFilter.toLowerCase());

        const collectionIncludesFilter = curr.node.collection?.name
          ?.toLowerCase()
          ?.includes(searchFilter.toLowerCase());

        if (includesFilter || collectionIncludesFilter) {
          acc.push(curr.node);
        }

        return acc;
      }, []) ?? [],
    [data?.walletNftAggregate, searchFilter]
  );

  return nfts;
};
