import {
  debug,
  PortChannel,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
} from "@200ms/common";
import * as recoil from "@200ms/recoil";

export function setupClient() {
  debug("setting up core background clients");
  recoil.setupSolanaConnectionBackgroundClient();
  coreSetupBackgroundClient();
}

function coreSetupBackgroundClient() {
  //
  // Client to communicate from the UI to the background script.
  //
  const backgroundClient = PortChannel.client(CONNECTION_POPUP_RPC);
  recoil.setBackgroundClient(backgroundClient);

  //
  // Client to send responses from the UI to the background script.
  // Used when the background script asks the UI to do something, e.g.,
  // approve a transaction.
  //
  const backgroundResponseClient = PortChannel.client(
    CONNECTION_POPUP_RESPONSE
  );
  recoil.setBackgroundResponseClient(backgroundResponseClient);

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
