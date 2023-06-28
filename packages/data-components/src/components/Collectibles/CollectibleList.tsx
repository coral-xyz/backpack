import { useCallback } from "react";
import { FlatList, type ListRenderItem, View } from "react-native";
import { useMedia } from "@coral-xyz/tamagui";

import { CollectibleCard } from "./CollectibleCard";
import type { CollectibleGroup } from "./utils";

export type CollectibleListProps = {
  collectibleGroups: CollectibleGroup[];
  imageBoxSize: number;
  onCardClick: () => void;
  onOptionsClick: () => void;
};

export function CollectibleList({
  collectibleGroups,
  imageBoxSize,
  onCardClick,
  onOptionsClick,
}: CollectibleListProps) {
  const media = useMedia();

  const numColumns = media.sm
    ? 2
    : media.md
    ? 3
    : media.lg
    ? 4
    : media.xl
    ? 5
    : media.xxl
    ? 6
    : 7;

  const gap = media.sm ? 12 : media.md ? 18 : 24;

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
        imageBoxSize={imageBoxSize}
        onCardClick={onCardClick}
        onOptionsClick={onOptionsClick}
      />
    ),
    [onCardClick, onOptionsClick]
  );

  return (
    <View style={{ display: "flex" }}>
      <FlatList
        key={numColumns}
        showsVerticalScrollIndicator={false}
        style={{ alignSelf: "center", marginHorizontal: 16, marginTop: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        columnWrapperStyle={{ gap }}
        numColumns={numColumns}
        data={collectibleGroups}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </View>
  );
}
