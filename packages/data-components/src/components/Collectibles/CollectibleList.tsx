import { UI_RPC_METHOD_TOGGLE_SHOW_ALL_COLLECTIBLES } from "@coral-xyz/common";
import { showAllCollectibles, useBackgroundClient } from "@coral-xyz/recoil";
import { useMedia, YStack } from "@coral-xyz/tamagui";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  type ListRenderItem,
} from "react-native";
import { useRecoilValue } from "recoil";

import type { CollectiblesProps } from ".";
import { CollectibleCard } from "./CollectibleCard";
import { ShowUnverifiedToggle } from "./ShowUnverifiedToggle";
import type { CollectibleGroup } from "./utils";

export type CollectibleListProps = {
  collectibleGroups: CollectibleGroup[];
  EmptyStateComponent?: CollectiblesProps["EmptyStateComponent"];
  enableShowUnverifiedButton?: boolean;
};

// Placeholder collection name
const placeholder = "placeholder-lads-ftw";

export function CollectibleList({
  collectibleGroups: baseCollectibleGroups,
  enableShowUnverifiedButton,
  EmptyStateComponent,
}: CollectibleListProps) {
  const [numColumns, setNumColumns] = useState(2);

  const media = useMedia();
  const imageBoxSize = Platform.select({ native: 165, web: 165 });
  const background = useBackgroundClient();
  const showAll = useRecoilValue(showAllCollectibles);

  const gap = _getGap(media);

  const visibleGroups = useMemo(() => {
    if (enableShowUnverifiedButton) {
      return showAll
        ? baseCollectibleGroups
        : baseCollectibleGroups.filter((group) => group.whitelisted);
    }
    return baseCollectibleGroups;
  }, [baseCollectibleGroups, enableShowUnverifiedButton, showAll]);

  // Handles dynamic column count and update
  useEffect(() => {
    if (!imageBoxSize) return;
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      const columns = Math.floor((width - gap) / (imageBoxSize + gap));
      setNumColumns(Math.max(columns, 2));
    };

    // Subscribe to dimension changes
    const subscription = Dimensions.addEventListener("change", updateColumns);
    updateColumns(); // Initial setup

    return () => {
      subscription.remove();
    };
  }, [gap, imageBoxSize]);

  // Add placeholder items to fill the last row when the number of items is not a multiple of the number of columns
  // Not the proudest implementation, but required to keep the grid layout consistent in flatList, otherwise use a different library or change layouts.
  const lastColumnItems = visibleGroups.length % numColumns;
  const collectibleGroups = useMemo(() => {
    if (visibleGroups.length % numColumns !== numColumns) {
      return [
        ...visibleGroups,
        ...Array(numColumns - lastColumnItems).fill({
          collection: placeholder,
          data: [],
        }),
      ];
    } else {
      return visibleGroups;
    }
  }, [visibleGroups, lastColumnItems, numColumns]);

  const handleToggleShowAll = useCallback(async () => {
    await background.request({
      method: UI_RPC_METHOD_TOGGLE_SHOW_ALL_COLLECTIBLES,
      params: [],
    });
  }, [background]);

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
    ({ item }) => {
      if (item.collection === placeholder)
        return <YStack key={item.collection} style={{ width: imageBoxSize }} />;
      return <CollectibleCard key={item.collection} collectibles={item} />;
    },
    [imageBoxSize]
  );

  return (
    <YStack space="$2" flex={1}>
      {EmptyStateComponent && visibleGroups.length === 0 ? (
        <EmptyStateComponent hasHiddenItems={collectibleGroups.length > 0} />
      ) : (
        <FlatList
          key={numColumns}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 16, width: "100%" }}
          contentContainerStyle={{
            gap: 14,
            paddingHorizontal: 16,
            paddingBottom: 16,
            minHeight: "100%",
          }}
          columnWrapperStyle={{ gap, justifyContent: "space-around" }}
          numColumns={numColumns}
          data={collectibleGroups}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListFooterComponent={
            enableShowUnverifiedButton &&
            (showAll || collectibleGroups.length !== visibleGroups.length) ? (
              <ShowUnverifiedToggle
                style={{ pb: 4 }}
                show={showAll}
                toggleShow={handleToggleShowAll}
              />
            ) : undefined
          }
        />
      )}
    </YStack>
  );
}

const _getGap = (media: ReturnType<typeof useMedia>): number =>
  media.sm ? 16 : media.md ? 20 : 24;

const _getImageBoxSize = () => Platform.select({ native: 165, web: 165 });
