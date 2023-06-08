import { useCallback } from "react";
import {
  SectionList,
  type SectionListData,
  type SectionListRenderItem,
} from "react-native";
import {
  ListHeaderCore,
  ListSectionSeparatorCore,
  RoundedContainerGroup,
  Separator,
} from "@coral-xyz/tamagui";

import type { ResponseNotification } from ".";
import { NotificationListItem } from "./NotificationListItem";
import type { NotificationGroup } from "./utils";

export type NotificationListProps = {
  notificationGroups: NotificationGroup[];
  onAcceptFriendRequest?: (
    activeUserId: string,
    otherUserId: string
  ) => void | Promise<void>;
  onDeclineFriendRequest?: (
    activeUserId: string,
    otherUserId: string
  ) => void | Promise<void>;
  onItemClick?: (n: ResponseNotification) => void;
};

export function NotificationList({
  notificationGroups,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onItemClick,
}: NotificationListProps) {
  /**
   * Returns the child component key for an item.
   * @param {ResponseNotification} item
   * @returns {string}
   */
  const keyExtractor = useCallback((item: ResponseNotification) => item.id, []);

  /**
   * Returns a renderable component for an individual item in a list.
   * @param {{ item: ResponseNotification, section: SectionListData<ResponseNotification, NotificationGroup>, index: number }} args
   * @returns {ReactElement}
   */
  const renderItem: SectionListRenderItem<
    ResponseNotification,
    NotificationGroup
  > = useCallback(
    ({ item, section, index }) => {
      const first = index === 0;
      const last = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          disableBottomRadius={!last}
          disableTopRadius={!first}
        >
          <NotificationListItem
            notification={item}
            onClick={onItemClick}
            onAcceptFriendRequest={onAcceptFriendRequest}
            onDeclineFriendRequest={onDeclineFriendRequest}
          />
        </RoundedContainerGroup>
      );
    },
    [onAcceptFriendRequest, onDeclineFriendRequest, onItemClick]
  );

  /**
   * Returns a renderable component for the header of the each section.
   * @param {{ section: SectionListData<ResponseNotification, NotificationGroup> }} info
   * @returns {ReactElement}
   */
  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<ResponseNotification, NotificationGroup>;
    }) => (
      <ListHeaderCore
        style={{ marginBottom: 0, marginTop: 16 }}
        title={section.date}
      />
    ),
    []
  );

  return (
    <SectionList
      style={{ marginHorizontal: 16, marginBottom: 24 }}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      sections={notificationGroups}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      SectionSeparatorComponent={ListSectionSeparatorCore}
      ItemSeparatorComponent={Separator}
    />
  );
}
