import { BackgroundClient } from "../channel";
import { getLogger } from "../logging";
import { ChannelAppUi } from "../channel";
import {
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
} from "../constants";

const logger = getLogger("common/background/client");

let _backgroundClient: BackgroundClient | null = null;
let _backgroundResponseClient: BackgroundClient | null = null;

export function setBackgroundClient(c: BackgroundClient) {
  _backgroundClient = c;
}

export function setBackgroundResponseClient(c: BackgroundClient) {
  _backgroundResponseClient = c;
}

export function getBackgroundClient(): BackgroundClient {
  if (_backgroundClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundClient;
}

export function getBackgroundResponseClient(): BackgroundClient {
  if (_backgroundResponseClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundResponseClient;
}

export function setupBackgroundClientAppUi() {
  logger.debug("setting up core background clients");

  //
  // Client to communicate from the UI to the background script.
  //
  setBackgroundClient(ChannelAppUi.client(CONNECTION_POPUP_RPC));

  //
  // Client to send responses from the UI to the background script.
  // Used when the background script asks the UI to do something, e.g.,
  // approve a transaction.
  //
  setBackgroundResponseClient(ChannelAppUi.client(CONNECTION_POPUP_RESPONSE));

  //
  // Keep the keyring store unlocked with a continuous poll.
  //
  setInterval(() => {
    getBackgroundClient().request({
      method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
      params: [],
    });
  }, 5 * 60 * 1000);
}
