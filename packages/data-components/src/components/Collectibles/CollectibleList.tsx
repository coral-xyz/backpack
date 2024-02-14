import { UI_RPC_METHOD_TOGGLE_SHOW_ALL_COLLECTIBLES } from "@coral-xyz/common";
import { showAllCollectibles, useBackgroundClient } from "@coral-xyz/recoil";
import { useMedia, YStack } from "@coral-xyz/tamagui";
import { useCallback, useMemo } from "react";
import { FlatList, type ListRenderItem } from "react-native";
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

export function CollectibleList({
  collectibleGroups,
  enableShowUnverifiedButton,
  EmptyStateComponent,
}: CollectibleListProps) {
  const media = useMedia();
  const background = useBackgroundClient();
  const showAll = useRecoilValue(showAllCollectibles);

  const numColumns = _getNumberOfColumns(media);
  const gap = _getGap(media);

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
    ({ item }) => <CollectibleCard key={item.collection} collectibles={item} />,
    []
  );

  const visibleGroups = useMemo(() => {
    if (enableShowUnverifiedButton) {
      return showAll
        ? collectibleGroups
        : collectibleGroups.filter((group) => group.whitelisted);
    }
    return collectibleGroups;
  }, [collectibleGroups, enableShowUnverifiedButton, showAll]);

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
          columnWrapperStyle={{ gap }}
          numColumns={numColumns}
          data={visibleGroups}
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

const _getNumberOfColumns = (media: ReturnType<typeof useMedia>): number =>
  media.sm ? 2 : media.md ? 3 : media.lg ? 4 : media.xl ? 5 : media.xxl ? 6 : 7;
