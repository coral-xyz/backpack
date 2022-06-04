import {
  getLogger,
  PortChannel,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
  SOLANA_CONNECTION_RPC_UI,
} from "@200ms/common";
import * as cmn from "@200ms/common";

const logger = getLogger("extension/background/client");

export function setupClient() {
  logger.debug("setting up core background clients");

  //
  // Client to communicate from the UI to the background script for the
  // solana Connection API.
  //
  cmn.setupSolanaConnectionBackgroundClient(
    PortChannel.client(SOLANA_CONNECTION_RPC_UI)
  );

  //
  // Client to communicate from the UI to the background script.
  //
  cmn.setBackgroundClient(PortChannel.client(CONNECTION_POPUP_RPC));

  //
  // Client to send responses from the UI to the background script.
  // Used when the background script asks the UI to do something, e.g.,
  // approve a transaction.
  //
  cmn.setBackgroundResponseClient(
    PortChannel.client(CONNECTION_POPUP_RESPONSE)
  );

  //
  // Keep the keyring store unlocked with a continuous poll.
  //
  setInterval(() => {
    cmn.getBackgroundClient().request({
      method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
      params: [],
    });
  }, 5 * 60 * 1000);
}
