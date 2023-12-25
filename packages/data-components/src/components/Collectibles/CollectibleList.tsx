import { type ReactNode, useCallback } from "react";
import { FlatList, type ListRenderItem, View } from "react-native";
import { useMedia, YStack } from "@coral-xyz/tamagui";

import type { DataComponentScreenProps } from "../common";

import { CollectibleCard } from "./CollectibleCard";
import type { CollectibleGroup } from "./utils";

export type CollectibleListProps = {
  collectibleGroups: CollectibleGroup[];
  emptyStateComponent?: DataComponentScreenProps["emptyStateComponent"];
  header?: ReactNode;
};

export function CollectibleList({
  collectibleGroups,
  emptyStateComponent,
  header,
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

  const gap = media.sm ? 16 : media.md ? 20 : 24;

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
    ({ item }) => <CollectibleCard key={item.collection} collectibles={item} />,
    []
  );

  return (
    <YStack space="$2" flex={1}>
      {header}
      {collectibleGroups.length === 0 ? (
        emptyStateComponent
      ) : (
        <FlatList
          key={numColumns}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 16, width: "100%" }}
          contentContainerStyle={{
            gap: 14,
            paddingHorizontal: 16,
            paddingBottom: 16,
            justifyContent: "center",
            minHeight: "100%",
          }}
          columnWrapperStyle={{ gap }}
          numColumns={numColumns}
          data={collectibleGroups}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      )}
    </YStack>
  );
}
