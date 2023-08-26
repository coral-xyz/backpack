import { type ReactNode, Suspense, useMemo } from "react";
import { useActiveWallet } from "@coral-xyz/recoil";

import { gql } from "../../apollo";
import type { ProviderId } from "../../apollo/graphql";
import { usePolledSuspenseQuery } from "../../hooks";

import { CollectibleList } from "./CollectibleList";
import { getGroupedCollectibles, type ResponseCollectible } from "./utils";

export type { ResponseCollectible };

const DEFAULT_POLLING_INTERVAL = 60000;

const GET_COLLECTIBLES = gql(`
  query GetCollectibles($address: String!, $providerId: ProviderID!) {
    user {
      id
      wallet(address: $address, providerId: $providerId) {
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
              compressed
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

export const Collectibles = ({
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
        providerId: activeWallet.blockchain.toUpperCase() as ProviderId,
      },
    }
  );

  /**
   * Memoized value of the collectible items owned by the wallet that are
   * grouped by collection address, or singletons by their mint if they have no parent
   */
  const groupedCollectibles = useMemo(
    () =>
      getGroupedCollectibles(
        data.user?.wallet?.nfts?.edges.map((e) => e.node) ?? []
      ),
    [data.user]
  );

  return (
    <CollectibleList
      collectibleGroups={groupedCollectibles}
      imageBoxSize={165}
      onCardClick={() => alert("CLICK")}
      onOptionsClick={() => alert("OPTIONS CLICK")}
    />
  );
}
