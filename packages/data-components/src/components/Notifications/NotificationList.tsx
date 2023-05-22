import { useCallback, useMemo } from "react";
import {
  SectionList,
  type SectionListData,
  type SectionListRenderItem,
} from "react-native";
import { useSuspenseQuery_experimental } from "@apollo/client";
import {
  ListHeaderCore,
  ListSectionSeparatorCore,
  RoundedContainerGroup,
  Separator,
} from "@coral-xyz/tamagui";

import { gql } from "../../apollo";
import { type Notification, SortDirection } from "../../apollo/graphql";

import { NotificationListItem } from "./NotificationListItem";
import { getGroupedNotifications, type NotificationGroup } from "./utils";

const GET_NOTIFICATIONS = gql(`
  query GetNotifications($filters: NotificationFiltersInput) {
    user {
      id
      notifications(filters: $filters) {
        edges {
          node {
            id
            app {
              id
              image
              name
            }
            body
            source
            timestamp
            title
            viewed
          }
        }
      }
    }
  }
`);

export type NotificationListProps = {
  onItemClick?: (n: Notification) => void;
};

export function NotificationList({ onItemClick }: NotificationListProps) {
  const { data } = useSuspenseQuery_experimental(GET_NOTIFICATIONS, {
    variables: {
      filters: {
        limit: 50,
        sortDirection: SortDirection.Desc,
      },
    },
  });

  /**
   * Memoized value for the extracted notifications list from the GraphQL response.
   */
  const notifications = useMemo(
    () => data.user?.notifications?.edges.map((e) => e.node) ?? [],
    [data.user]
  );

  /**
   * Memoized notifications list that are grouped by the date they were sent.
   */
  const groupedNotifications = useMemo(
    () => getGroupedNotifications(notifications),
    [notifications]
  );

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
    useCallback(({ item, section, index }) => {
      const first = index === 0;
      const last = index === section.data.length - 1;
      return (
        <RoundedContainerGroup
          style={{ marginBottom: last ? 24 : undefined }}
          disableBottomRadius={!last}
          disableTopRadius={!first}
        >
          <NotificationListItem onClick={onItemClick} notification={item} />
        </RoundedContainerGroup>
      );
    }, []);

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
      sections={groupedNotifications}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      SectionSeparatorComponent={ListSectionSeparatorCore}
      ItemSeparatorComponent={Separator}
    />
  );
}
