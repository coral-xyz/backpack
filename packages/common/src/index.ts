import type { PublicKey } from "@solana/web3.js";
import type { RpcRequest } from "@coral-xyz/common-public";
import type { Context, RpcResponse, EventEmitter } from "./types";

export * from "@coral-xyz/common-public";
export * from "./constants";
export * from "./crypto";
export * from "./channel";
export * from "./browser";
export * from "./types";
export * from "./solana";
export * from "./ethereum";
export * from "./explorer";
export * from "./plugin";
export * from "./feature-gates";

// Generated pre-build step.
export * from "./generated-config";

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

export function walletAddressDisplay(publicKey: PublicKey | string) {
  const pubkeyStr: string =
    typeof publicKey === "string" ? publicKey : publicKey.toString();
  return `${pubkeyStr.slice(0, 4)}...${pubkeyStr.slice(pubkeyStr.length - 4)}`;
}
