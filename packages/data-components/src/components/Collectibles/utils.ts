import type { GetCollectiblesQuery } from "../../apollo/graphql";

export type ResponseCollectible = NonNullable<
  NonNullable<NonNullable<GetCollectiblesQuery["user"]>["wallet"]>["nfts"]
>["edges"][number]["node"];

export type CollectibleGroup = {
  collection: string;
  data: ResponseCollectible[];
};

/**
 * Group the argued list of collectibles by their parent collection address. If
 * the collectible doesn't have a parent collection, its entry will be grouped
 * by itself under its own mint.
 * @export
 * @param {ResponseCollectible[]} collectibles
 * @returns {CollectibleGroup[]}
 */
export function getGroupedCollectibles(
  collectibles: ResponseCollectible[]
): CollectibleGroup[] {
  const collectibleGroupMap: Record<string, ResponseCollectible[]> = {};
  for (const c of collectibles) {
    const key = c.collection?.address ?? c.address;
    if (collectibleGroupMap[key]) {
      collectibleGroupMap[key].push(c);
    } else {
      collectibleGroupMap[key] = [c];
    }
  }

  return Object.entries(collectibleGroupMap).reduce<CollectibleGroup[]>(
    (acc, curr) => {
      acc.push({ collection: curr[0], data: curr[1] });
      return acc;
    },
    []
  );
}
