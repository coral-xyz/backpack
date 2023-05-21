import type { Notification } from "../../apollo/graphql";

/**
 * Format a string for the argued `Date` instance.
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date: Date): string {
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
  return `${mm} ${dd}, ${yyyy}`;
}

type NotificationGroup = {
  date: string;
  notifications: Notification[];
};

/**
 * Group the argued list of notifications by date.
 * @export
 * @param {Notification[]} notifications
 * @returns {NotificationGroup[]}
 */
export function getGroupedNotifications(
  notifications: Notification[]
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
        notifications: [uniqueNotifications[i]],
      });
    } else {
      groupedNotifications[groupedNotifications.length - 1].notifications.push(
        uniqueNotifications[i]
      );
    }
  }

  return groupedNotifications;
}

/**
 * Convert the argued timestamp into a semantic period of time string.
 * @export
 * @param {string} timestamp
 * @returns {string}
 */
export function getTimeStr(timestamp: string): string {
  const time = new Date(timestamp).getTime();
  const elapsedTimeSeconds = (new Date().getTime() - time) / 1000;
  if (elapsedTimeSeconds < 60) {
    return "now";
  }
  if (elapsedTimeSeconds / 60 < 60) {
    const min = Math.floor(elapsedTimeSeconds / 60);
    if (min === 1) {
      return "1 min";
    } else {
      return `${min} mins`;
    }
  }

  if (elapsedTimeSeconds / 3600 < 24) {
    const hours = Math.floor(elapsedTimeSeconds / 3600);
    if (hours === 1) {
      return "1 hour";
    } else {
      return `${hours} hours`;
    }
  }
  const days = Math.floor(elapsedTimeSeconds / 3600 / 24);
  if (days === 1) {
    return `1 day`;
  }
  return `${days} days`;
}
