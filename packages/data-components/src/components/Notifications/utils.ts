import { formatDate } from "@coral-xyz/common";

import type { GetNotificationsQuery } from "../../apollo/graphql";

export type ResponseNotification = NonNullable<
  NonNullable<GetNotificationsQuery["user"]>["notifications"]
>["edges"][number]["node"];

export type NotificationGroup = {
  date: string;
  data: ResponseNotification[];
};

/**
 * Group the argued list of notifications by date.
 * @export
 * @param {ResponseNotification[]} notifications
 * @returns {NotificationGroup[]}
 */
export function getGroupedNotifications(
  notifications: ResponseNotification[]
): NotificationGroup[] {
  const groupedNotifications: NotificationGroup[] = [];
  const bodies = notifications.map((n) => JSON.stringify(n.body));

  const uniqueNotifications = notifications
    .slice()
    .filter(
      (x, index) =>
        x.source !== "friend_requests" ||
        bodies.indexOf(JSON.stringify(x.body)) === index
    );

  for (let i = 0; i < uniqueNotifications.length; i++) {
    const date = formatDate(new Date(uniqueNotifications[i].timestamp));
    if (
      groupedNotifications.length === 0 ||
      groupedNotifications[groupedNotifications.length - 1].date !== date
    ) {
      groupedNotifications.push({
        date,
        data: [uniqueNotifications[i]],
      });
    } else {
      groupedNotifications[groupedNotifications.length - 1].data.push(
        uniqueNotifications[i]
      );
    }
  }

  return groupedNotifications;
}
