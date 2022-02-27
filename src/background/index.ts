import {
  Channel,
  CHANNEL_RPC_REQUEST,
  CHANNEL_NOTIFICATION,
  RPC_METHOD_CONNECT,
  RPC_METHOD_DISCONNECT,
  NOTIFICATION_CONNECTED,
} from "../common";
import { Context, Backend } from "../backend";

const backend = new Backend();

const notificationChannel = new Channel(CHANNEL_NOTIFICATION);
const rpcChannel = new Channel(CHANNEL_RPC_REQUEST);

function main() {
  rpcChannel.handler(withContext(handleRpc));
}

function handleRpc(ctx: Context, message: Message) {
  const { id } = message.data;
  const [result, error] = _handleRpc(ctx, message);
  ctx.sendResponse({
    id,
    result,
    error,
  });
}

function _handleRpc(ctx: Context, message: Message): any {
  const { method, params } = message.data;
  switch (method) {
    case RPC_METHOD_CONNECT:
      return handleConnect(ctx, params[0]);
    case RPC_METHOD_DISCONNECT:
      return handleDisconnect(ctx);
    default:
      throw new Error(`unexpected rpc method: ${method}`);
  }
}

function handleConnect(ctx: Context, onlyIfTrustedMaybe: boolean) {
  const resp = backend.connect(ctx, onlyIfTrustedMaybe);
  notificationChannel.sendMessageActiveTab({
    name: NOTIFICATION_CONNECTED,
  });
  return [resp];
}

function handleDisconnect(ctx: Context) {
  const resp = backend.disconnect(ctx);
  notificationChannel.sendMessageActiveTab({
    name: NOTIFICATION_CONNECTED,
  });
  return [resp];
}

function withContext(
  handler: (ctx: Context, message: Message) => void
): (message: Message, sender: any, sendResponse: any) => void {
  return (message: any, sender: any, sendResponse: any) => {
    const ctx = { sender, sendResponse };
    return handler(ctx, message);
  };
}

type Message = {
  data: Data;
};

type Data = RpcRequest;

type RpcRequest = {
  // Request id for client tracking.
  id: number;
  method: string;
  params: any[];
};

main();
