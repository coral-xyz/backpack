/**
 * Format a string for the argued `Date` instance.
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date: Date): string {
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
