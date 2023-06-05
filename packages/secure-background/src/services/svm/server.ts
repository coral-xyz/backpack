import { Blockchain } from "@coral-xyz/common";

import type { KeyringStore } from "../../store/keyring";
import type {
  TransportHandler,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types/transports";
import { SecureUIClient } from "../secureUI/client";
import type { SECURE_UI_EVENTS } from "../secureUI/events";

import type {
  SECURE_SVM_EVENTS,
  SECURE_SVM_SIGN_ALL_TX,
  SECURE_SVM_SIGN_MESSAGE,
  SECURE_SVM_SIGN_TX,
} from "./events";

export class SVMService {
  public destroy: TransportRemoveListener;
  private secureUIClient: SecureUIClient;
  private keyringStore: KeyringStore;

  constructor(interfaces: {
    secureServer: TransportReceiver<SECURE_SVM_EVENTS>;
    keyringStore: KeyringStore;
    secureUIClient: TransportSender<SECURE_UI_EVENTS>;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureUIClient = new SecureUIClient(interfaces.secureUIClient);
    this.destroy = interfaces.secureServer.setHandler(
      this.eventHandler.bind(this)
    );
  }

  private eventHandler: TransportHandler<SECURE_SVM_EVENTS> = (request) => {
    switch (request.name) {
      case "SECURE_SVM_SIGN_MESSAGE":
        return this.handleSignMessage(request);
      case "SECURE_SVM_SIGN_TX":
        return this.handleSign(request);
      case "SECURE_SVM_SIGN_ALL_TX":
        return this.handleSignAll(request);
    }
  };

  private handleSignMessage: TransportHandler<SECURE_SVM_SIGN_MESSAGE> =
    async ({ request }) => {
      const approved = await this.secureUIClient.approveSignMessage({
        ...request,
        displayOptions: {
          popup: true,
        },
      });

      if (!approved) {
        throw "Denied";
      }

      const blockchainKeyring =
        this.keyringStore.activeUserKeyring.keyringForBlockchain(
          Blockchain.SOLANA
        );
      return {
        name: "SECURE_SVM_SIGN_MESSAGE",
        response: {
          singedMessage: await blockchainKeyring.signMessage(
            request.message,
            request.publicKey
          ),
        },
      };
    };

  private handleSign: TransportHandler<SECURE_SVM_SIGN_TX> = async ({
    request,
  }) => {
    return {
      name: "SECURE_SVM_SIGN_TX",
      response: {
        signedTx: "string",
      },
    };
  };

  private handleSignAll: TransportHandler<SECURE_SVM_SIGN_ALL_TX> = async ({
    request,
  }) => {
    return {
      name: "SECURE_SVM_SIGN_ALL_TX",
      response: {
        signedTx: ["string"],
      },
    };
  };
}
