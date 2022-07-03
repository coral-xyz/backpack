import { v1 } from "uuid";

export function toTitleCase(blockchain: string) {
  return (
    blockchain.slice(0, 1).toUpperCase() + blockchain.toLowerCase().slice(1)
  );
}

/**
 * Formats a number or number string into a pretty USD string
 * @example
 * formatUSD(-1234567.89) // "-$1,234,567.89"
 */
export function formatUSD(amount: number | string) {
  const amountNumber = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(String(amountNumber)));
}

/**
 * A globally unique ID generator, useful for stateless or readonly things
 * @returns
 * uuid/v1, in case we need to extract the timestamp when debugging
 */
export function generateUniqueId() {
  return v1();
}

/**
 * True if we're in the mobile environment.
 */
export const IS_MOBILE = globalThis.chrome
  ? // `global.chrome` exists, we're in chromium.
    false
  : globalThis.browser
  ? // `global.browser` exists, we're in FF/safari.
    false
  : true;
