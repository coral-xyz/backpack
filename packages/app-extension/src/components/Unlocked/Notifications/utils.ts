import type { Notification } from "../../../graphql/graphql";

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
  return `${dd} ${mm} ${yyyy}`;
}

/**
 * Group the argued list of notifications by date.
 * @export
 * @param {Notification[]} notifications
 * @returns {{ date: string; notifications: Notification[] }[]}
 */
export function getGroupedNotifications(
  notifications: Notification[]
): { date: string; notifications: Notification[] }[] {
  const groupedNotifications: {
    date: string;
    notifications: Notification[];
  }[] = [];

  const uniqueNotifications = notifications
    .slice()
    .sort((a, b) =>
      new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime() ? 1 : -1
    )
    .filter(
      (x, index) =>
        x.source !== "friend_requests" ||
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
