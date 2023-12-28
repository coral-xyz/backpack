import type { PublicKey } from "@solana/web3.js";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Format the argued `Date` object into an AM/PM timestamp.
 * @export
 * @param {Date} date
 * @returns {string}
 */
export function formatAmPm(date: Date): string {
  let hours = date.getHours();
  let minutes: string | number = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutes + " " + ampm;
}

/**
 * Format a string for the argued `Date` instance.
 * @param {Date} date
 * @param {boolean} [includeTime]
 * @returns {string}
 */
export function formatDate(date: Date, includeTime?: boolean): string {
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
  const time = includeTime ? ` at ${date.toLocaleTimeString()}` : "";
  return `${mm} ${dd}, ${yyyy}${time}`;
}

/**
 * Convert the argued timestamp into a semantic period of time string.
 * @export
 * @param {number | string} timestamp
 * @returns {string}
 */
export function formatSemanticTimeDifference(
  timestamp: number | string
): string {
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

/**
 * Convert a snake case string into normalized title case.
 * @export
 * @param {string} input
 * @returns {string}
 */
export function formatSnakeToTitleCase(input: string): string {
  const parts = input.split("_").map((t) => t.toLowerCase());
  const titleCasesParts = parts.map((p) =>
    p.length === 1 ? p : `${p[0].toUpperCase()}${p.slice(1)}`
  );

  for (let i = 0; i < titleCasesParts.length; i++) {
    if (["Bpf", "Nft"].includes(titleCasesParts[i])) {
      titleCasesParts[i] = titleCasesParts[i].toUpperCase();
    }
  }

  return titleCasesParts.join(" ");
}

/**
 * Formats a number or number string into a pretty USD string
 * @example
 * formatUsd(-1234567.89) // "-$1,234,567.89"
 */
export function formatUsd(amount: number | string) {
  let amountNumber: number;
  if (typeof amount === "string") {
    amountNumber = Number(amount.replace(",", ""));
  } else {
    amountNumber = amount;
  }
  return usd.format(amountNumber);
}

/**
 * Format the argued username to be truncated based on max length.
 * @export
 * @param {string} username
 * @param {number} [maxLength=10]
 * @returns {string}
 */
export function formatUsername(username: string, maxLength = 10): string {
  if (!username) {
    return "";
  }
  if (username.length <= maxLength) {
    return username;
  }
  return username.slice(0, maxLength - 2) + "..";
}

/**
 * Format the argued public key to be truncated for UI display.
 * @export
 * @param {(PublicKey | string)} publicKey
 * @param {number} [numDigits=4]
 * @returns {string}
 */
export function formatWalletAddress(
  publicKey: PublicKey | string,
  numDigits = 4
): string {
  if (!publicKey) return "";
  const pubkeyStr: string =
    typeof publicKey === "string" ? publicKey : publicKey.toString();
  return `${pubkeyStr.slice(0, numDigits)}...${pubkeyStr.slice(
    pubkeyStr.length - numDigits
  )}`;
}

export function formatTitleCase(str: string) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export function formatTokenAmount(amount: number, maximumFractionDigits = 7) {
  return amount.toLocaleString(undefined, {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  });
}
