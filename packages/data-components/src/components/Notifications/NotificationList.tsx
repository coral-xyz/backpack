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

import type { Notification } from "../../apollo/graphql";

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
  onItemClick?: (n: Notification) => void;
};

export function NotificationList({
  notificationGroups,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onItemClick,
}: NotificationListProps) {
  /**
   * Returns the child component key for an item.
   * @param {Notification} item
   * @returns {string}
   */
  const keyExtractor = useCallback((item: Notification) => item.id, []);

  /**
   * Returns a renderable component for an individual item in a list.
   * @param {{ item: Notification, section: SectionListData<Notification, NotificationGroup>, index: number }} args
   * @returns {ReactElement}
   */
  const renderItem: SectionListRenderItem<Notification, NotificationGroup> =
    useCallback(
      ({ item, section, index }) => {
        const first = index === 0;
        const last = index === section.data.length - 1;
        return (
          <RoundedContainerGroup
            disableBottomRadius={!last}
            disableTopRadius={!first}
            style={{ marginBottom: last ? 24 : undefined }}
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
   * @param {{ section: SectionListData<Notification, NotificationGroup> }} info
   * @returns {ReactElement}
   */
  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<Notification, NotificationGroup>;
    }) => <ListHeaderCore style={{ marginBottom: 0 }} title={section.date} />,
    []
  );

  return (
    <SectionList
      style={{ marginHorizontal: 16, marginTop: 16 }}
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
