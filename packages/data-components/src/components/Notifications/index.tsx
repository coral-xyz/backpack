import type { ReactNode} from "react";
import { Suspense, useMemo } from "react";
import { useSuspenseQuery_experimental } from "@apollo/client";

import { gql } from "../../apollo";
import { SortDirection } from "../../apollo/graphql";

import {
  NotificationList,
  type NotificationListProps,
} from "./NotificationList";
import { getGroupedNotifications } from "./utils";

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

export type NotificationsProps = Omit<
  NotificationListProps,
  "notificationGroups"
> & {
  loaderComponent?: ReactNode;
};

export function Notifications({
  loaderComponent,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onItemClick,
}: NotificationsProps) {
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

  return (
    <Suspense fallback={loaderComponent}>
      <NotificationList
        notificationGroups={groupedNotifications}
        onItemClick={onItemClick}
        onAcceptFriendRequest={onAcceptFriendRequest}
        onDeclineFriendRequest={onDeclineFriendRequest}
      />
    </Suspense>
  );
}
