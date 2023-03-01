import type { PublicKey } from "@solana/web3.js";

import type { Event } from ".";
import { LEDGER_IFRAME_URL } from "./constants";
import {
  BACKPACK_CONFIG_EXTENSION_KEY,
  BACKPACK_CONFIG_VERSION,
} from "./generated-config";
import type {
  Context,
  EventEmitter,
  Nft,
  RpcRequest,
  RpcResponse,
  Sender,
} from "./types";

export * from "./api";
export * from "./browser";
export * from "./channel";
export * from "./constants";
export * from "./crypto";
export * from "./ethereum";
export * from "./explorer";
export * from "./feature-gates";
export * from "./logging";
export * from "./messages";
export * from "./notifications";
export * from "./plugin";
export * from "./preferences";
export * from "./solana";
export * from "./types";
export * from "./utils";
export { useStore } from "./zustand-store";

// Generated pre-build step.
export * from "./generated-config";

// Utility to transform the handler API into something a little more friendly.
export function withContext<Backend>(
  backend: Backend,
  events: EventEmitter,
  handler: (ctx: Context<Backend>, req: RpcRequest) => Promise<RpcResponse>
): ({ data }: { data: RpcRequest }, sender: Sender) => Promise<RpcResponse> {
  return async ({ data }: { data: RpcRequest }, sender: Sender) => {
    const ctx = { backend, events, sender };
    return await handler(ctx, data);
  };
}

export function withContextPort<Backend>(
  backend: Backend,
  events: EventEmitter,
  handler: (ctx: Context<Backend>, req: RpcRequest) => Promise<RpcResponse>
): (data: RpcRequest, sender: Sender) => Promise<RpcResponse> {
  return async (data: RpcRequest, sender: Sender) => {
    const ctx = { backend, events, sender };
    return await handler(ctx, data);
  };
}

export function walletAddressDisplay(
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

export function usernameDisplay(username: string, maxLength = 10) {
  if (!username) {
    return "";
  }
  if (username.length <= maxLength) {
    return username;
  }
  return username.slice(0, maxLength - 2) + "..";
}

/**
 * Message to be signed for authenticating a user.
 */
export function getAuthMessage(uuid: string) {
  return `Backpack login ${uuid}`;
}

/**
 * Message to be signed for creating a Backpack account.
 */
export function getCreateMessage(publicKey: string) {
  return `Backpack create ${publicKey}`;
}

/**
 * Message to be signed when adding public keys to an existing Backpack account.
 */
export function getAddMessage(publicKey: string) {
  return `Backpack add ${publicKey}`;
}

//
// Returns true if the event can be used by an injected provider, i.e.,
// it's from a trusted source.
//
// This is used by both xNFTs and normal websites, so we allow
// events to come from either the window's origin (a website)
// or the parent chrome extension (an xNFT).
//
export function isValidEventOrigin(event: Event): boolean {
  // From same window. Note: window not defined in the service worker context.
  if (typeof window !== "undefined") {
    if (event.origin === window.location.origin) {
      return true;
    }
  }

  try {
    // From the extension.
    const url = new URL(event.origin);
    if (url.host === BACKPACK_CONFIG_EXTENSION_KEY) {
      return true;
    }

    // From trusted ledger API.
    const ledgerUrl = new URL(LEDGER_IFRAME_URL);
    if (url.host === ledgerUrl.host) {
      return true;
    }
  } catch (err) {
    return false;
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

export function isMadLads(nft: Nft) {
  // TODO
  return nft.id === "FLMYJnabb2HvyGzE6EgXfLu4bHxugkwVyeEmSitisWKa";
}
