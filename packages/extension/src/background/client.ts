import { PortChannelClient } from "../common";
import {
  debug,
  PortChannel,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
} from "../common";

let _backgroundClient: PortChannelClient | null = null;
let _backgroundResponseClient: PortChannelClient | null = null;

export function setupBackgroundClient() {
  debug("bootstrapping ui");

  // Client to communicate from the UI to the background script.
  const backgroundClient = PortChannel.client(CONNECTION_POPUP_RPC);
  setBackgroundClient(backgroundClient);

  // Client to send responses from the UI to the background script.
  // Used when the background script asks the UI to do something, e.g.,
  // approve a transaction.
  const backgroundResponseClient = PortChannel.client(
    CONNECTION_POPUP_RESPONSE
  );
  setBackgroundResponseClient(backgroundResponseClient);

  // Keep the keyring store unlocked with a continuous poll.
  setInterval(() => {
    backgroundClient.request({
      method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
      params: [],
    });
  }, 5 * 60 * 1000);
}

export function setBackgroundClient(c: PortChannelClient) {
  _backgroundClient = c;
}

export function setBackgroundResponseClient(c: PortChannelClient) {
  _backgroundResponseClient = c;
}

export function getBackgroundClient(): PortChannelClient {
  if (_backgroundClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundClient;
}

export function getBackgroundResponseClient(): PortChannelClient {
  if (_backgroundResponseClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundResponseClient;
}
