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

/**
 * Convert a snake case string into normalized title case.
 * @export
 * @param {string} input
 * @returns {string}
 */
export function snakeToTitleCase(input: string): string {
  const parts = input.split("_").map((t) => t.toLowerCase());
  const titleCasesParts = parts.map((p) =>
    p.length === 1 ? p : `${p[0].toUpperCase()}${p.slice(1)}`
  );

  if (titleCasesParts[0] === "Nft") {
    titleCasesParts[0] = titleCasesParts[0].toUpperCase();
  }

  return titleCasesParts.join(" ");
}
