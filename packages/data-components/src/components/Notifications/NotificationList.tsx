import { useMemo } from "react";
import { useSuspenseQuery_experimental } from "@apollo/client";
import { ListCore, YStack } from "@coral-xyz/tamagui";

import { gql } from "../../apollo";
import { SortDirection } from "../../apollo/graphql";

import { NotificationListItem } from "./NotificationListItem";
import { getGroupedNotifications } from "./utils";

const GET_NOTIFICATIONS = gql(`
  query GetNotifications($filters: NotificationFiltersInput) {
    user {
      id
      notifications(filters: $filters) {
        edges {
          node {
            id
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
  onOpenDrawer?: () => void;
};

export function NotificationList({ onOpenDrawer }: NotificationListProps) {
  const { data } = useSuspenseQuery_experimental(GET_NOTIFICATIONS, {
    variables: {
      filters: {
        limit: 50,
        sortDirection: SortDirection.Desc,
      },
    },
  });

  const notifications = useMemo(
    () => data.user?.notifications?.edges.map((e) => e.node) ?? [],
    [data.user]
  );

  const groupedNotifications = useMemo(
    () => getGroupedNotifications(notifications),
    [notifications]
  );

  return groupedNotifications.length > 0 ? (
    <YStack gap={32} paddingBottom={16}>
      {groupedNotifications.map((group) => (
        <ListCore key={group.date} heading={group.date}>
          {group.notifications.map((notif, idx) => (
            <NotificationListItem
              key={notif.id}
              isFirst={idx === 0}
              isLast={idx === group.notifications.length - 1}
              notification={notif}
              onClick={onOpenDrawer}
            />
          ))}
        </ListCore>
      ))}
    </YStack>
  ) : null; // FIXME:
}
