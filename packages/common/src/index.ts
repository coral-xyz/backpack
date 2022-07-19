import type { Context, RpcRequest, RpcResponse, EventEmitter } from "./types";

export * from "./constants";
export * from "./crypto";
export * from "./logging";
export * from "./channel";
export * from "./browser";
export * from "./types";
export * from "./solana";
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
