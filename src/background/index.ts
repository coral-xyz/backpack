import {
  log,
  Channel,
  CHANNEL_RPC_REQUEST,
  CHANNEL_NOTIFICATION,
  RPC_METHOD_CONNECT,
  RPC_METHOD_DISCONNECT,
  NOTIFICATION_CONNECTED,
} from "../common";

const notificationChannel = new Channel(CHANNEL_NOTIFICATION);
const rpcChannel = new Channel(CHANNEL_RPC_REQUEST);

function main() {
  rpcChannel.handler(handleRpc);
}

function handleRpc(message: Message, sender: any, sendResponse: any) {
  const { id } = message.data;
  const [result, error] = _handleRpc(message);
  sendResponse({
    id,
    result,
    error,
  });
}

function _handleRpc(message: Message): any {
  const { method, params } = message.data;

  switch (method) {
    case RPC_METHOD_CONNECT:
      return handleConnect(params[0]);
    case RPC_METHOD_DISCONNECT:
      return handleDisconnect();
    default:
      throw new Error(`unexpected rpc method: ${method}`);
  }
}

function handleConnect(onlyIfTrustedMaybe: boolean) {
  notificationChannel.sendMessage({
    name: NOTIFICATION_CONNECTED,
  });
  // todo
  log("handling connect, only if trusted maybe", onlyIfTrustedMaybe);
  return ["connected yay"];
}

function handleDisconnect() {
  // todo
  log("handling disconnect");
  return ["disconnected yay"];
}

main();

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
