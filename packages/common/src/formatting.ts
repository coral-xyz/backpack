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
export function formatUsername(
  username: string,
  maxLength = 10
): string {
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
