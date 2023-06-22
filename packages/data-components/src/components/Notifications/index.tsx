import { type ReactNode, Suspense, useMemo } from "react";
import { useMutation } from "@apollo/client";
import { useUnreadCount } from "@coral-xyz/recoil";
import { useAsyncEffect } from "use-async-effect";

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

const DEFAULT_POLLING_INTERVAL = 30000;

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
              address
              image
              name
            }
            body
            dbId
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

const MARK_NOTIFICATIONS_AS_READ = gql(`
  mutation MarkNotificationsAsRead($ids: [Int!]!) {
    markNotificationsAsRead(ids: $ids)
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
  const [, setUnreadCount] = useUnreadCount();
  const [markNotificationsAsRead] = useMutation(MARK_NOTIFICATIONS_AS_READ);
  const { data } = usePolledSuspenseQuery(
    pollingInterval ?? DEFAULT_POLLING_INTERVAL,
    GET_NOTIFICATIONS,
    {
      fetchPolicy: "cache-and-network",
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
  const notifications: ResponseNotification[] = useMemo(
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
   * Async component effect to mark the discovered unread notifications as read
   * via the GraphQL mutation function.
   */
  useAsyncEffect(async () => {
    const unread = notifications.reduce<number[]>((acc, curr) => {
      if (!curr.viewed) {
        acc.push(curr.dbId);
      }
      return acc;
    }, []);

    if (unread.length === 0) return;
    await markNotificationsAsRead({ variables: { ids: unread } });
    setUnreadCount(0);
  }, [markNotificationsAsRead, notifications, setUnreadCount]);

  return (
    <NotificationList
      notificationGroups={groupedNotifications}
      onItemClick={onItemClick}
      onAcceptFriendRequest={onAcceptFriendRequest}
      onDeclineFriendRequest={onDeclineFriendRequest}
    />
  );
}
