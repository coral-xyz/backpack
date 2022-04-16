export * from "./constants";
export * from "./crypto";
export * from "./logging";
export * from "./request-manager";

// Utility to transform the handler API into something a little more friendly.
export function withContext(
  handler: (ctx: Context, req: RpcRequest) => Promise<RpcResponse>
): ({ data }: { data: RpcRequest }, sender: any) => Promise<RpcResponse> {
  return async ({ data }: { data: RpcRequest }, sender: any) => {
    const ctx = { sender };
    return await handler(ctx, data);
  };
}

export type Context = {
  sender: any;
};

export type RpcRequest = {
  id?: number;
  method: string;
  params: any[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type RpcResponse<T = any> = any;

export type Notification = {
  name: string;
  data?: any;
};

export type Event = any;
export type EventHandler = (notif: any) => void;
export type ResponseHandler = [Function, Function];
