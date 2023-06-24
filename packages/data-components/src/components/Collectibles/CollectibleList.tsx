import { useCallback } from "react";
import { FlatList, type ListRenderItem } from "react-native";

import { CollectibleCard } from "./CollectibleCard";
import type { CollectibleGroup } from "./utils";

export type CollectibleListProps = {
  collectibleGroups: CollectibleGroup[];
  onCardClick: () => void;
};

export function CollectibleList({
  collectibleGroups,
  onCardClick,
}: CollectibleListProps) {
  /**
   * Returns the child component key for an item.
   * @param {CollectibleGroup} item
   * @returns {string}
   */
  const keyExtractor = useCallback(
    (item: CollectibleGroup) => item.collection,
    []
  );

  /**
   * Render the child component of the group list.
   * @param {ListRenderItemInfo<CollectibleGroup>} info
   * @returns {ReactElement}
   */
  const renderItem: ListRenderItem<CollectibleGroup> = useCallback(
    ({ item }) => (
      <CollectibleCard
        key={item.collection}
        collectibles={item}
        onCardClick={onCardClick}
      />
    ),
    [onCardClick]
  );

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      style={{ marginHorizontal: 16, marginTop: 16 }}
      // contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
      columnWrapperStyle={{ gap: 12 }}
      numColumns={2}
      data={collectibleGroups}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
}
