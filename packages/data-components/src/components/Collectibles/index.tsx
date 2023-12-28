import { Suspense, useMemo } from "react";

import { gql } from "../../apollo";
import type { ProviderId } from "../../apollo/graphql";
import { usePolledSuspenseQuery } from "../../hooks";
import type { DataComponentScreenProps } from "../common";

import { CollectibleList } from "./CollectibleList";
import { type CollectiblesContextType, CollectiblesProvider } from "./context";
import {
  type CollectibleGroup,
  getGroupedCollectibles,
  type ResponseCollectible,
} from "./utils";

export type { CollectibleGroup, ResponseCollectible };
export { CollectibleDetails } from "./CollectibleDetails";
export { CollectibleGroupView } from "./CollectibleGroupView";
export { LockCollectionToggle } from "./LockCollectionToggle";

const DEFAULT_POLLING_INTERVAL_SECONDS = 60;

export const GET_COLLECTIBLES_QUERY = gql(`
  query GetCollectibles($address: String!, $providerId: ProviderID!) {
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
  }
`);

export type CollectiblesProps = DataComponentScreenProps & {
  address: string;
  onCardClick: CollectiblesContextType["onCardClick"];
  onOpenSendDrawer?: CollectiblesContextType["onOpenSendDrawer"];
  onViewClick: CollectiblesContextType["onViewClick"];
  providerId: ProviderId;
};

export const Collectibles = ({
  loaderComponent,
  onCardClick,
  onOpenSendDrawer,
  onViewClick,
  ...rest
}: CollectiblesProps) => (
  <Suspense fallback={loaderComponent}>
    <CollectiblesProvider
      showItemCount
      onCardClick={onCardClick}
      onOpenSendDrawer={onOpenSendDrawer}
      onViewClick={onViewClick}
    >
      <_Collectibles {...rest} />
    </CollectiblesProvider>
  </Suspense>
);

function _Collectibles({
  address,
  emptyStateComponent,
  fetchPolicy,
  pollingIntervalSeconds,
  providerId,
}: Pick<
  CollectiblesProps,
  | "address"
  | "emptyStateComponent"
  | "fetchPolicy"
  | "pollingIntervalSeconds"
  | "providerId"
>) {
  const { data } = usePolledSuspenseQuery(
    pollingIntervalSeconds ?? DEFAULT_POLLING_INTERVAL_SECONDS,
    GET_COLLECTIBLES_QUERY,
    {
      fetchPolicy,
      errorPolicy: "all",
      variables: {
        address,
        providerId,
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
        data?.wallet?.nfts?.edges.map((e) => e.node) ?? []
      ),
    [data]
  );

  return (
    <CollectibleList
      collectibleGroups={groupedCollectibles}
      emptyStateComponent={emptyStateComponent}
    />
  );
}
