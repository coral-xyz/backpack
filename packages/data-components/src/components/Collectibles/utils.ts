import type { GetCollectiblesQuery } from "../../apollo/graphql";

export type ResponseCollectible = NonNullable<
  NonNullable<GetCollectiblesQuery["wallet"]>["nfts"]
>["edges"][number]["node"];

export type CollectibleGroup = {
  collection: string;
  data: ResponseCollectible[];
  whitelisted: boolean;
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
    const key = c.collection?.name ?? c.name ?? "Unknown";
    if (collectibleGroupMap[key]) {
      collectibleGroupMap[key].push(c);
    } else {
      collectibleGroupMap[key] = [c];
    }
  }

  return Object.entries(collectibleGroupMap)
    .reduce<CollectibleGroup[]>((acc, curr) => {
      acc.push({
        collection: curr[0],
        data: curr[1],
        whitelisted: curr[1][0].whitelisted,
      });
      return acc;
    }, [])
    .sort((a, b) => {
      // TODO: revisit...should be sorting associated with the server side results ordering
      if (a.collection === "Mad Lads") return -1;
      else if (b.collection === "Mad Lads") return 1;
      else if (a.collection === "Tensorians") return -1;
      else if (b.collection === "Tensorians") return 1;
      else if (a.whitelisted && b.whitelisted)
        return b.data.length - a.data.length;
      else if (a.whitelisted) return -1;
      else if (b.whitelisted) return 1;
      return b.data.length - a.data.length;
    });
}
