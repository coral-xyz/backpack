// Note(peter): copied from extension
import { useEffect } from "react";
import type { EnrichedNotification } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useRecoilState } from "recoil";

import { unreadCount } from "../atoms/unreadCount";

import { useAuthenticatedUser, useRecentNotifications } from "./";

const formatDate = (date: Date) => {
  const months = [
    "Jan",
    "Feb",
    "March",
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const mm = months[date.getMonth()];
  const dd = date.getDate();
  const yyyy = date.getFullYear();
  return `${dd} ${mm} ${yyyy}`;
};

const getGroupedNotifications = (notifications: EnrichedNotification[]) => {
  const groupedNotifications: {
    date: string;
    notifications: EnrichedNotification[];
  }[] = [];

  const uniqueNotifications = notifications
    .slice()
    .sort((a, b) =>
      new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ? 1 : -1
    )
    .filter(
      (x, index) =>
        x.xnft_id !== "friend_requests" ||
        notifications.map((y) => y.body).indexOf(x.body) === index
    );
  const sortedNotifications = uniqueNotifications.sort((a, b) =>
    new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ? 1 : -1
  );

  for (let i = 0; i < sortedNotifications.length; i++) {
    const date = formatDate(new Date(sortedNotifications[i].timestamp));
    if (
      groupedNotifications.length === 0 ||
      groupedNotifications[groupedNotifications.length - 1].date !== date
    ) {
      groupedNotifications.push({
        date,
        notifications: [sortedNotifications[i]],
      });
    } else {
      groupedNotifications[groupedNotifications.length - 1].notifications.push(
        sortedNotifications[i]
      );
    }
  }

  return groupedNotifications;
};

export function NotificationsData({ children }) {
  const authenticatedUser = useAuthenticatedUser();
  const [, setUnreadCount] = useRecoilState(unreadCount);
  const notifications: EnrichedNotification[] = useRecentNotifications({
    limit: 50,
    offset: 0,
    uuid: authenticatedUser?.uuid ?? "",
  });

  useEffect(() => {
    (async function f() {
      const allNotifications = notifications.slice();
      const uniqueNotifications = allNotifications
        .sort((a, b) =>
          new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime()
            ? 1
            : -1
        )
        .filter(
          (x, index) =>
            x.xnft_id !== "friend_requests" ||
            allNotifications.map((y) => y.body).indexOf(x.body) === index
        );

      const sortedNotifications = uniqueNotifications.sort((a, b) =>
        new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime()
          ? 1
          : -1
      );

      const latestNotification = sortedNotifications[0];
      if (latestNotification && latestNotification.id) {
        await fetch(`${BACKEND_API_URL}/notifications/cursor`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lastNotificationId: latestNotification.id,
          }),
        });
      }

      await fetch(`${BACKEND_API_URL}/notifications/seen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds: notifications
            .filter((x) => !x.viewed)
            .map(({ id }) => id),
        }),
      });

      setUnreadCount(0);
    })();
  }, [notifications, setUnreadCount]);

  const groupedNotifications: {
    date: string;
    notifications: EnrichedNotification[];
  }[] = getGroupedNotifications(notifications);

  return children({ groupedNotifications });
}
