import type { Event } from "@coral-xyz/common";
import {
  BACKPACK_CONFIG_EXTENSION_KEY,
  BACKPACK_CONFIG_VERSION,
} from "@coral-xyz/common";

export { ChainedRequestManager } from "./chained-request-manager";
export { ProviderEthereumInjection } from "./provider-ethereum";
export { ProviderEthereumXnftInjection } from "./provider-ethereum-xnft";
export { ProviderSolanaInjection } from "./provider-solana";
export { ProviderSolanaXnftInjection } from "./provider-solana-xnft";
export { RequestManager } from "./request-manager";
export { ProviderRootXnftInjection } from "./root-provider-xnft";

//
// Returns true if the event can be used by an injected provider, i.e.,
// it's from a trusted source.
//
// This is used by both xNFTs and normal websites, so we allow
// events to come from either the window's origin (a website)
// or the parent chrome extension (an xNFT).
//
export function isValidEventOrigin(event: Event): boolean {
  // From same window.
  if (event.origin === window.location.origin) {
    return true;
  }

  // From the extension.
  const url = new URL(event.origin);
  if (url.host === BACKPACK_CONFIG_EXTENSION_KEY) {
    return true;
  }

  // Development mode. Note: production is a production build, but still
  // in development.
  if (
    BACKPACK_CONFIG_VERSION === "development" ||
    BACKPACK_CONFIG_VERSION !== "production"
  ) {
    return true;
  }

  return false;
}
