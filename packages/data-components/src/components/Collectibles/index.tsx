import { type ReactNode, Suspense, useMemo } from "react";
import { useActiveWallet } from "@coral-xyz/recoil";

import { gql } from "../../apollo";
import { usePolledSuspenseQuery } from "../../hooks";

import { getGroupedCollectibles, type ResponseCollectible } from "./utils";

const DEFAULT_POLLING_INTERVAL = 60000;

const GET_COLLECTIBLES = gql(`
  query GetCollectibles($address: String!) {
    user {
      id
      wallet(address: $address) {
        id
        nfts {
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
              image
              name
            }
          }
        }
      }
    }
  }
`);

export type CollectiblesProps = {
  loaderComponent?: ReactNode;
  pollingInterval?: number;
};

export const Notifications = ({
  loaderComponent,
  ...rest
}: CollectiblesProps) => (
  <Suspense fallback={loaderComponent}>
    <_Collectibles {...rest} />
  </Suspense>
);

function _Collectibles({
  pollingInterval,
}: Omit<CollectiblesProps, "loaderComponent">) {
  const activeWallet = useActiveWallet();
  const { data } = usePolledSuspenseQuery(
    pollingInterval ?? DEFAULT_POLLING_INTERVAL,
    GET_COLLECTIBLES,
    {
      variables: {
        address: activeWallet.publicKey,
      },
    }
  );

  /**
   * Memoized value for the extracted wallet NFTs from the GraphQL response
   */
  const collectibles: ResponseCollectible[] = useMemo(
    () => data.user?.wallet?.nfts?.edges.map((e) => e.node) ?? [],
    [data.user]
  );

  /**
   * Memoized value of the collectible items owned by the wallet that are
   * grouped by collection address, or singletons by their mint if they have no parent
   */
  const groupedCollectibles = useMemo(
    () => getGroupedCollectibles(collectibles),
    [collectibles]
  );

  return <div>{groupedCollectibles.map((c) => c.collection).join(", ")}</div>;
}
