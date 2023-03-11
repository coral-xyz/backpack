import { useGroupCollections, useUser } from "@coral-xyz/recoil";

export const useSearchedGroupsCollections = (searchFilter: string) => {
  const { uuid } = useUser();
  const collections = useGroupCollections({ uuid });

  return collections
    .filter((x) => x.name?.toLowerCase()?.includes(searchFilter.toLowerCase()))
    .map((x) => ({
      name: x.name || "",
      image: x.image || "",
      collectionId: x.collectionId || "",
    }));
};
