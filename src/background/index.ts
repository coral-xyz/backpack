import {
  debug,
  Channel,
  PortChannel,
  BrowserRuntime,
  CHANNEL_RPC_REQUEST,
  CHANNEL_NOTIFICATION,
  RPC_METHOD_CONNECT,
  RPC_METHOD_DISCONNECT,
  RPC_METHOD_SIGN_AND_SEND_TX,
  RPC_METHOD_SIGN_MESSAGE,
  NOTIFICATION_CONNECTED,
  EXTENSION_WIDTH,
  EXTENSION_HEIGHT,
  CONNECTION_NAME_POPUP,
} from "../common";
import { Context, Backend } from "../backend";

// Backend implementation. Handles business logic of RPC requests.
const backend = new Backend();

// Channel to send notifications from the background to the injected script.
const notificationChannel = new Channel(CHANNEL_NOTIFICATION);

// Channel to send rpc requests from the injected script to the channel.
const rpcChannel = new Channel(CHANNEL_RPC_REQUEST);

function main() {
  // Handle RPC requests from the injected client.
  rpcChannel.handler(withContext(handleRpc));

  // Handle RPC requests from the extesnion UI.
  PortChannel.handler(CONNECTION_NAME_POPUP, handleRpcUi);
}

function handleRpcUi(msg: any): any {
  const { id, method, params } = msg;
  debug(`handle rpc ${method}`);
  console.log("handling rpc ui", msg);
  return "success handle rpc ui";
}

function handleRpc(ctx: Context, message: Message) {
  debug(`handle rpc ${message.data.method}`);
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
    case RPC_METHOD_SIGN_AND_SEND_TX:
      return handleSignAndSendTx(ctx, params[0]);
    case RPC_METHOD_SIGN_MESSAGE:
      return handleSignMessage(ctx, params[0]);
    default:
      throw new Error(`unexpected rpc method: ${method}`);
  }
}

function handleConnect(ctx: Context, onlyIfTrustedMaybe: boolean) {
  const resp = backend.connect(ctx, onlyIfTrustedMaybe);
  notificationChannel.sendMessageActiveTab({
    name: NOTIFICATION_CONNECTED,
  });
  openPopupWindow();
  return [resp];
}

function handleDisconnect(ctx: Context) {
  const resp = backend.disconnect(ctx);
  notificationChannel.sendMessageActiveTab({
    name: NOTIFICATION_CONNECTED,
  });
  return [resp];
}

function handleSignAndSendTx(ctx: Context, tx: any) {
  const resp = backend.signAndSendTx(ctx, tx);
  return [resp];
}

function handleSignMessage(ctx: Context, msg: any) {
  const resp = backend.signMessage(ctx, msg);
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

function openPopupWindow() {
  BrowserRuntime.getLastFocusedWindow().then((window: any) => {
    BrowserRuntime.openWindow({
      url: "popup.html",
      type: "popup",
      width: EXTENSION_WIDTH,
      height: EXTENSION_HEIGHT,
      top: window.top,
      left: window.left + (window.width - EXTENSION_WIDTH),
      //      setSelfAsOpener: true, // Doesn't work on firefox.
      focused: true,
    });
  });
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
