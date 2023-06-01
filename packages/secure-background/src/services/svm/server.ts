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
  private secureUIClient: TransportClient<any>;
  private keystoreClient: TransportClient<any>;

  constructor(interfaces: {
    secureServer: TransportServer<SECURE_SVM_EVENTS>;
    keystoreClient: TransportClient<any>;
    secureUIClient: TransportClient<any>;
  }) {
    this.keystoreClient = interfaces.keystoreClient;
    this.secureUIClient = interfaces.secureUIClient;
    this.destroy = interfaces.secureServer.setListener(this.eventHandler);
  }

  private eventHandler: TransportHandler<SECURE_SVM_EVENTS> = (request) => {
    switch (request.name) {
      case "SECURE_SVM_SIGN_MESSAGE":
        return this.handleSignMessage(request);
      case "SECURE_SVM_SIGN_TX":
        return this.handleSign(request);
    }
  };

  private handleSignMessage: TransportHandler<SECURE_SVM_SIGN_MESSAGE> = async (
    request
  ) => {
    return {
      name: "SECURE_SVM_SIGN_MESSAGE",
      response: {
        singedMessage: "Hello",
      },
    };
  };

  private handleSign: TransportHandler<SECURE_SVM_SIGN_TX> = async (
    request
  ) => {
    return {
      name: "SECURE_SVM_SIGN_TX",
      response: {
        signedTx: "string",
      },
    };
  };
}
