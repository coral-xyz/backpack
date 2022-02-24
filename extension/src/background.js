const CHANNEL_CONTENT_REQUEST = "anchor-content-request";

const RPC_METHOD_CONNECT = "connect";
const RPC_METHOD_DISCONNECT = "disconnect";

function main() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.channel) {
      case CHANNEL_CONTENT_REQUEST:
        handleContent(message, sender, sendResponse);
        break;
      default:
        // no-op
        break;
    }
  });
}

function handleContent(message, sender, sendResponse) {
  const { id } = message.data;
  const [result, error] = handleRpc(message, sender, sendResponse);
  sendResponse({
    id,
    result,
    error,
  });
}

function handleRpc(message, sender, sendResponse) {
  const { method, params } = message.data;

  switch (method) {
    case RPC_METHOD_CONNECT:
      return handleConnect(...params);
    case RPC_METHOD_DISCONNECT:
      return handleDisconnect(...params);
    default:
      throw new Error(`unexpected rpc method: ${method}`);
  }
}

function handleConnect() {
  // todo
  log("handling connect");
  return ["connected yay"];
}

function handleDisconnect() {
  // todo
  log("handling disconnect");
  return ["disconnected yay"];
}

function log(str, ...args) {
  console.log(`anchor-background: ${str}`, ...args);
}

function error(str, ...args) {
  console.error(`anchor-background: ${str}`, ...args);
}

main();
