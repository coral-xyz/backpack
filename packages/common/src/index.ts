import type { Context, RpcRequest, RpcResponse } from "./types";

export * from "./constants";
export * from "./crypto";
export * from "./logging";
export * from "./request-manager";
export * from "./channel";
export * from "./browser";
export * from "./types";
export * from "./solana";
export * from "./utils";
export * from "./background";
export * from "./popup";

// Utility to transform the handler API into something a little more friendly.
export function withContext(
  handler: (ctx: Context, req: RpcRequest) => Promise<RpcResponse>
): ({ data }: { data: RpcRequest }, sender: any) => Promise<RpcResponse> {
  return async ({ data }: { data: RpcRequest }, sender: any) => {
    const ctx = { sender };
    return await handler(ctx, data);
  };
}
