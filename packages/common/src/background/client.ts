import { getLogger } from "../logging";
import { ChannelAppUi, ChannelAppUiClient } from "../channel";
import {
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
} from "../constants";

const logger = getLogger("common/background/client");

let _backgroundClient: ChannelAppUiClient | null = null;
let _backgroundResponseClient: ChannelAppUiClient | null = null;

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

export function getBackgroundClient(): ChannelAppUiClient {
  if (_backgroundClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundClient;
}

export function getBackgroundResponseClient(): ChannelAppUiClient {
  if (_backgroundResponseClient === null) {
    throw new Error("_backgroundClient not initialized");
  }
  return _backgroundResponseClient;
}

function setBackgroundClient(c: ChannelAppUiClient) {
  _backgroundClient = c;
}

function setBackgroundResponseClient(c: ChannelAppUiClient) {
  _backgroundResponseClient = c;
}
