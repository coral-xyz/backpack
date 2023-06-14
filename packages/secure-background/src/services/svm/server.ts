import { Blockchain } from "@coral-xyz/common";

import type { KeyringStore } from "../../store/keyring";
import type {
  TransportHandler,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types/transports";
import { SecureUIClient } from "../secureUI/client";

import type {
  SECURE_SVM_EVENTS,
  SECURE_SVM_SAY_HELLO,
  SECURE_SVM_SIGN_ALL_TX,
  SECURE_SVM_SIGN_MESSAGE,
  SECURE_SVM_SIGN_TX,
} from "./events";

export class SVMService {
  public destroy: TransportRemoveListener;
  private secureUIClient: SecureUIClient;
  private keyringStore: KeyringStore;

  constructor(interfaces: {
    secureReceiver: TransportReceiver<SECURE_SVM_EVENTS, "response">;
    keyringStore: KeyringStore;
    secureUISender: TransportSender<SECURE_SVM_EVENTS, "confirmation">;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureUIClient = new SecureUIClient(interfaces.secureUISender);
    this.destroy = interfaces.secureReceiver.setHandler(
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
      case "SECURE_SVM_SAY_HELLO":
        return this.handleHello(request);
    }
  };

  private handleSignMessage: TransportHandler<SECURE_SVM_SIGN_MESSAGE> = async (
    event
  ) => {
    console.log("PCA HANDLE sign message", event);
    // const confirm = await this.secureUISender.send(request)
    const confirmation = await this.secureUIClient.confirm(event);

    console.log("PCA confirmation", confirmation);
    if (confirmation.error || !confirmation.response?.confirmed) {
      return {
        name: "SECURE_SVM_SIGN_MESSAGE",
        error: "User Denied Request",
      };
    }

    const blockchainKeyring =
      this.keyringStore.activeUserKeyring.keyringForBlockchain(
        Blockchain.SOLANA
      );

    if (blockchainKeyring.ledgerKeyring) {
      // open ledger prompt
    }

    const singedMessage = await blockchainKeyring.signMessage(
      event.request.message,
      event.request.publicKey
    );

    if (blockchainKeyring.ledgerKeyring) {
      // close ledger prompt
    }

    console.log("PCA responde to contentscript", singedMessage);

    return {
      name: "SECURE_SVM_SIGN_MESSAGE",
      response: {
        singedMessage,
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

  private handleHello: TransportHandler<SECURE_SVM_SAY_HELLO> = async ({
    request,
  }) => {
    return {
      name: "SECURE_SVM_SAY_HELLO",
      response: {
        message: "hello " + request.name,
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
