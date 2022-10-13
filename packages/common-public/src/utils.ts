import { v1 } from "uuid";
import { IMAGE_PROXY_URL } from "./constants";

export function toTitleCase(str: string) {
  return str.slice(0, 1).toUpperCase() + str.toLowerCase().slice(1);
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

export function isServiceWorker(): boolean {
  return globalThis.clients !== undefined;
}

/**
 * Make any necessary changes to URIs before the client queries them.
 *
 * TODO: replace host with host of caching layer for thumbnail generation, caching,
 * SVG sanitization, etc.
 */
export function externalResourceUri(uri: string): string {
  if (uri && uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return uri;
}

export function proxyImageUrl(url: string): string {
  if (url.startsWith("/")) {
    return url;
  }
  return `${IMAGE_PROXY_URL}/insecure/rs:fill:400:400:0:0/plain/${url}`;
}
