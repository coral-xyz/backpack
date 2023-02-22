import type { BigNumberish } from "@ethersproject/bignumber";
import type { BigNumber } from "ethers";
import { ethers } from "ethers";
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
  let amountNumber: number;
  if (typeof amount === "string") {
    amountNumber = Number(amount.replace(",", ""));
  } else {
    amountNumber = amount;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountNumber);
}

/**
 * A globally unique ID generator, useful for stateless or readonly things
 * @returns
 * uuid/v1, in case we need to extract the timestamp when debugging
 */
export function generateUniqueId() {
  return v1();
}

export function isMobile(): boolean {
  if (typeof window !== "undefined" && typeof window.document !== "undefined") {
    return false;
  }

  return true;
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
export function externalResourceUri(
  uri: string,
  options: { cached?: boolean } = {}
): string {
  if (uri) {
    uri = uri.replace(/\0/g, "");
  }
  if (uri && uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
    // return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (uri && uri.startsWith("ar://")) {
    return uri.replace("ar://", "https://arweave.net/");
  }
  if (options.cached) {
    return `https://swr.xnfts.dev/1hr/${uri}`;
  }
  return `${uri}`;
}

export function proxyImageUrl(url: string): string {
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    return `${IMAGE_PROXY_URL}/insecure/rs:fit:400:400:0:0/plain/${url}`;
  }
  return url;
}

export function toDisplayBalance(
  nativeBalance: BigNumber,
  decimals: BigNumberish,
  truncate = true
): string {
  let displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);

  if (truncate) {
    try {
      displayBalance = `${displayBalance.split(".")[0]}.${displayBalance
        .split(".")[1]
        .slice(0, 5)}`;
    } catch {
      // pass
    }
  }

  return ethers.utils.commify(displayBalance);
}
