import type { RpcRequest } from "@coral-xyz/common-public";
import type { PublicKey } from "@solana/web3.js";

import type { Context, EventEmitter, RpcResponse, Sender } from "./types";

export * from "./api";
export * from "./browser";
export * from "./channel";
export * from "./constants";
export * from "./crypto";
export * from "./ethereum";
export * from "./explorer";
export * from "./feature-gates";
export * from "./messages";
export * from "./notifications";
export * from "./plugin";
export * from "./preferences";
export * from "./solana";
export * from "./types";
export * from "@coral-xyz/common-public";

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
