import type { ReactNode } from "react";
import { Suspense, useMemo } from "react";

import { gql } from "../../apollo";
import {
  type GetNotificationsQuery,
  SortDirection,
} from "../../apollo/graphql";
import { usePolledSuspenseQuery } from "../../hooks";

import {
  NotificationList,
  type NotificationListProps,
} from "./NotificationList";
import { getGroupedNotifications } from "./utils";

const DEFAULT_POLLING_INTERVAL = 60000;

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

export type ResponseNotification = NonNullable<
  NonNullable<GetNotificationsQuery["user"]>["notifications"]
>["edges"][number]["node"];

export type NotificationsProps = Omit<
  NotificationListProps,
  "notificationGroups"
> & {
  loaderComponent?: ReactNode;
  pollingInterval?: number;
};

export const Notifications = ({
  loaderComponent,
  ...rest
}: NotificationsProps) => (
  <Suspense fallback={loaderComponent}>
    <_Notifications {...rest} />
  </Suspense>
);

function _Notifications({
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onItemClick,
  pollingInterval,
}: Omit<NotificationsProps, "loaderComponent">) {
  const { data } = usePolledSuspenseQuery(
    pollingInterval ?? DEFAULT_POLLING_INTERVAL,
    GET_NOTIFICATIONS,
    {
      variables: {
        filters: {
          limit: 50,
          sortDirection: SortDirection.Desc,
        },
      },
    }
  );

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
    <NotificationList
      notificationGroups={groupedNotifications}
      onItemClick={onItemClick}
      onAcceptFriendRequest={onAcceptFriendRequest}
      onDeclineFriendRequest={onDeclineFriendRequest}
    />
  );
}
