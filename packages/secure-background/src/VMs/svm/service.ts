import type { KeyringStore } from "../../localstore/keyring";
import type {
  SecureRequest,
  TransportClient,
  TransportHandler,
  TransportRemoveListener,
  TransportServer,
} from "../../types";

import type {
  SECURE_SVM_EVENTS,
  SECURE_SVM_SIGN_MESSAGE,
  SECURE_SVM_SIGN_TX,
} from "./events";

export class SVMService {
  public destroy: TransportRemoveListener;

  constructor(
    server: TransportServer<SECURE_SVM_EVENTS>,
    private uiClient: TransportClient<SECURE_SVM_EVENTS>,
    private keystore: KeyringStore
  ) {
    this.destroy = server.setListener(this.eventHandler);
  }

  private eventHandler: TransportHandler<SECURE_SVM_EVENTS> = (request) => {
    switch (request.name) {
      case "SECURE_SVM_SIGN_MESSAGE":
        return this.handleSignMessage(
          request as SecureRequest<SECURE_SVM_SIGN_MESSAGE>
        );
      case "SECURE_SVM_SIGN_TX":
        return this.handleSign(request as SecureRequest<SECURE_SVM_SIGN_TX>);
      default: {
        // If typescript complains here, an event from SECURE_SVM_EVENTS was not handled.
        // Do not throw here, it is okay for events from other handlers to fall through here.
        // Typescript makes sure we handle everything we need.
        const exhaustiveCheck: never = request.name; // eslint-disable-line @typescript-eslint/no-unused-vars
      }
    }
  };

  private handleSignMessage: TransportHandler<SECURE_SVM_SIGN_MESSAGE> = async (
    request
  ) => {
    throw "Not Implemented";
  };

  private handleSign: TransportHandler<SECURE_SVM_SIGN_TX> = async (
    request
  ) => {
    throw "Not Implemented";
  };
}
