import {
  debug,
  Channel,
  PortChannel,
  NotificationsClient,
  openPopupWindow,
  RpcRequest,
  RpcResponse,
  CHANNEL_RPC_REQUEST,
  CHANNEL_NOTIFICATION,
  RPC_METHOD_CONNECT,
  RPC_METHOD_DISCONNECT,
  RPC_METHOD_SIGN_AND_SEND_TX,
  RPC_METHOD_SIGN_MESSAGE,
  UI_RPC_NOTIFICATIONS_SUBSCRIBE,
  NOTIFICATION_CONNECTED,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_NOTIFICATIONS,
} from "../common";
import { Context, Backend } from "../backend";

// Backend implementation. Handles business logic of RPC requests.
const backend = new Backend();

// Channel to send notifications from the background to the injected script.
const notificationsInjected = Channel.client(CHANNEL_NOTIFICATION);

// Server receiving rpc requests from the injected script.
const rpcServerInjected = Channel.server(CHANNEL_RPC_REQUEST);

// Server rceiving rpc requests from the extension UI.
const rpcServerUi = PortChannel.server(CONNECTION_POPUP_RPC);

// Client to send notifications from the background script to the extension UI.
// This should only be created *after* the UI explicitly asks for it.
const notificationsUi = new NotificationsClient(CONNECTION_POPUP_NOTIFICATIONS);

function main() {
  rpcServerInjected.handler(withContext(handleRpc));
  rpcServerUi.handler(handleRpcUi);
}

function handleRpcUi<T = any>(msg: RpcRequest): RpcResponse<T> {
  const { method, params } = msg;
  switch (method) {
    case UI_RPC_NOTIFICATIONS_SUBSCRIBE:
      return handleNotificationsSubscribe();
    default:
      throw new Error(`unexpected ui rpc method: ${method}`);
  }
}

function handleRpc<T = any>(ctx: Context, req: RpcRequest): RpcResponse<T> {
  debug(`handle rpc ${req.method}`);
  const { method, params } = req;
  switch (method) {
    case RPC_METHOD_CONNECT:
      return handleConnect(ctx, params[0]);
    case RPC_METHOD_DISCONNECT:
      return handleDisconnect(ctx);
    case RPC_METHOD_SIGN_AND_SEND_TX:
      return handleSignAndSendTx(ctx, params[0]);
    case RPC_METHOD_SIGN_MESSAGE:
      return handleSignMessage(ctx, params[0]);
    default:
      throw new Error(`unexpected rpc method: ${method}`);
  }
}

function handleNotificationsSubscribe(): RpcResponse<string> {
  notificationsUi.connect();
  return ["success"];
}

function handleConnect(
  ctx: Context,
  onlyIfTrustedMaybe: boolean
): RpcResponse<string> {
  const resp = backend.connect(ctx, onlyIfTrustedMaybe);
  notificationsInjected.sendMessageActiveTab({
    name: NOTIFICATION_CONNECTED,
  });
  openPopupWindow();
  return [resp];
}

function handleDisconnect(ctx: Context): RpcResponse<string> {
  const resp = backend.disconnect(ctx);
  notificationsInjected.sendMessageActiveTab({
    name: NOTIFICATION_CONNECTED,
  });
  return [resp];
}

function handleSignAndSendTx(ctx: Context, tx: any): RpcResponse<string> {
  const resp = backend.signAndSendTx(ctx, tx);
  return [resp];
}

function handleSignMessage(ctx: Context, msg: any): RpcResponse<string> {
  const resp = backend.signMessage(ctx, msg);
  return [resp];
}

// Utility to transform the handler API into something a little more friendly.
function withContext(
  handler: (ctx: Context, req: RpcRequest) => RpcResponse
): ({ data }: { data: RpcRequest }, sender: any) => RpcResponse {
  return ({ data }: { data: RpcRequest }, sender: any) => {
    const ctx = { sender };
    return handler(ctx, data);
  };
}

main();
