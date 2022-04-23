import {
  debug,
  BackgroundClient,
  PortChannel,
  PortChannelClient,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
} from "@200ms/common";
import * as recoil from "@200ms/recoil";
import { setupSolanaConnectionBackgroundClient } from "@200ms/recoil";

export function setupBackgroundClients() {
  debug("setting up core background clients");
  setupSolanaConnectionBackgroundClient();
  coreSetupBackgroundClient();
}

function coreSetupBackgroundClient() {
  //
  // Client to communicate from the UI to the background script.
  //
  const backgroundClient = PortChannel.client(CONNECTION_POPUP_RPC);
  setBackgroundClient(backgroundClient);

  //
  // Client to send responses from the UI to the background script.
  // Used when the background script asks the UI to do something, e.g.,
  // approve a transaction.
  //
  const backgroundResponseClient = PortChannel.client(
    CONNECTION_POPUP_RESPONSE
  );
  setBackgroundResponseClient(backgroundResponseClient);

  //
  // Keep the keyring store unlocked with a continuous poll.
  //
  setInterval(() => {
    backgroundClient.request({
      method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
      params: [],
    });
  }, 5 * 60 * 1000);
}

//
// TODO: can remove these functions and just the recoil package directly.
//

export function setBackgroundClient(c: PortChannelClient) {
  recoil.setBackgroundClient(c);
}

export function setBackgroundResponseClient(c: PortChannelClient) {
  recoil.setBackgroundResponseClient(c);
}

export function getBackgroundClient(): BackgroundClient {
  return recoil.getBackgroundClient();
}

export function getBackgroundResponseClient(): BackgroundClient {
  return recoil.getBackgroundResponseClient();
}
