import { Blockchain } from "@coral-xyz/common";

import type { KeyringStore } from "../../store/keyring";
import type { SECURE_EVENTS } from "../../types/events";
import type {
  TransportHandler,
  TransportHandlers,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types/transports";
import { SecureUIClient } from "../secureUI/client";

import type { SECURE_SVM_EVENTS } from "./events";

export class SVMService {
  public destroy: TransportRemoveListener;
  private secureUIClient: SecureUIClient;
  private keyringStore: KeyringStore;

  constructor(interfaces: {
    secureReceiver: TransportReceiver<SECURE_SVM_EVENTS>;
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
    const handlers: TransportHandlers<SECURE_SVM_EVENTS> = {
      SECURE_SVM_SIGN_MESSAGE: this.handleSignMessage,
      SECURE_SVM_SIGN_TX: this.handleSign,
      SECURE_SVM_SIGN_ALL_TX: this.handleSignAll,
      SECURE_SVM_SAY_HELLO: this.handleHello,
    };

    const handler = handlers[request.name]?.bind(this);
    return handler && handler(request);
  };

  private handleSignMessage: TransportHandler<"SECURE_SVM_SIGN_MESSAGE"> =
    async (event) => {
      console.log("PCA HANDLE sign message", event);
      // const confirm = await this.secureUISender.send(request)
      const confirmation = await this.secureUIClient.confirm(event.event);

      console.log("PCA confirmation", confirmation);
      if (confirmation.error || !confirmation.response?.confirmed) {
        return event.error("User Denied Request");
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

      return event.respond({ singedMessage });
    };

  private handleSign: TransportHandler<"SECURE_SVM_SIGN_TX"> = async (
    event
  ) => {
    return event.respond({ signedTx: "string" });
  };

  private handleHello: TransportHandler<"SECURE_SVM_SAY_HELLO"> = async (
    event
  ) => {
    return event.respond({ message: "hello " + event.request.name });
  };

  private handleSignAll: TransportHandler<"SECURE_SVM_SIGN_ALL_TX"> = async ({
    respond,
  }) => {
    return respond({ signedTx: ["string"] });
  };
}
