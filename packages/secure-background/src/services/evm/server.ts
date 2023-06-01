import type { KeyringStore } from "../../localstore/keyring";
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
        return this.handleSignMessage(request);
      case "SECURE_EVM_SIGN_TX":
        return this.handleSign(request);
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
