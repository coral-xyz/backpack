import type { KeyringStore } from "@coral-xyz/background";

import type {
  SecureRequest,
  TransportClient,
  TransportHandler,
  TransportRemoveListener,
  TransportServer,
} from "../../types";

import type {
  SECURE_EVM_EVENTS,
  SECURE_EVM_SIGN_MESSAGE,
  SECURE_EVM_SIGN_TX,
} from "./events";

export class EVMService {
  public destroy: TransportRemoveListener;

  constructor(
    server: TransportServer<SECURE_EVM_EVENTS>,
    private uiClient: TransportClient<SECURE_EVM_EVENTS>,
    private keystore: KeyringStore
  ) {
    this.destroy = server.setListener(this.eventHandler);
  }

  private eventHandler: TransportHandler<SECURE_EVM_EVENTS> = (request) => {
    switch (request.name) {
      case "SECURE_EVM_SIGN_MESSAGE":
        return this.handleSignMessage(
          request as SecureRequest<SECURE_EVM_SIGN_MESSAGE>
        );
      case "SECURE_EVM_SIGN_TX":
        return this.handleSign(request as SecureRequest<SECURE_EVM_SIGN_TX>);
      default: {
        // If typescript complains here, an event from SECURE_EVM_EVENTS was not handled.
        // Do not throw here, it is okay for events from other handlers to fall through here.
        // Typescript makes sure we handle everything we need.
        const exhaustiveCheck: never = request.name; // eslint-disable-line @typescript-eslint/no-unused-vars
      }
    }
  };

  private handleSignMessage: TransportHandler<SECURE_EVM_SIGN_MESSAGE> = async (
    request
  ) => {
    throw "Not Implemented";
  };

  private handleSign: TransportHandler<SECURE_EVM_SIGN_TX> = async (
    request
  ) => {
    throw "Not Implemented";
  };
}
