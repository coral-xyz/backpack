import type { PublicKey } from "@solana/web3.js";

import type { Context, EventEmitter, RpcRequest, RpcResponse } from "./types";

export * from "./browser";
export * from "./channel";
export * from "./constants";
export * from "./crypto";
export * from "./ethereum";
export * from "./explorer";
export * from "./feature-gates";
// Generated pre-build step.
export * from "./generated-config";
export * from "./logging";
export * from "./messages";
export * from "./notifications";
export * from "./plugin";
export * from "./solana";
export * from "./types";
export * from "./utils";
export * from "./zustand-store";

// Utility to transform the handler API into something a little more friendly.
export function withContext<Backend>(
  backend: Backend,
  events: EventEmitter,
  handler: (ctx: Context<Backend>, req: RpcRequest) => Promise<RpcResponse>
): ({ data }: { data: RpcRequest }, sender: any) => Promise<RpcResponse> {
  return async ({ data }: { data: RpcRequest }, sender: any) => {
    const ctx = { backend, events, sender };
    return await handler(ctx, data);
  };
}

export function withContextPort<Backend>(
  backend: Backend,
  events: EventEmitter,
  handler: (ctx: Context<Backend>, req: RpcRequest) => Promise<RpcResponse>
): (data: RpcRequest) => Promise<RpcResponse> {
  return async (data: RpcRequest) => {
    const ctx = { backend, events, sender: undefined };
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
