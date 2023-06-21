import { Blockchain } from "@coral-xyz/common";

import type { KeyringStore } from "../../store/keyring";
import type {
  TransportHandler,
  TransportHandlers,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types/transports";
import { SecureUIClient } from "../secureUI/client";
import { UserClient } from "../user/client";

import type { SECURE_SVM_EVENTS } from "./events";

export class SVMService {
  public destroy: TransportRemoveListener;
  private secureUIClient: SecureUIClient;
  private userClient: UserClient;
  private keyringStore: KeyringStore;

  constructor(interfaces: {
    secureReceiver: TransportReceiver<SECURE_SVM_EVENTS>;
    secureSender: TransportSender;
    keyringStore: KeyringStore;
    secureUISender: TransportSender<SECURE_SVM_EVENTS, "confirmation">;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureUIClient = new SecureUIClient(interfaces.secureUISender);
    this.userClient = new UserClient(interfaces.secureSender);
    this.destroy = interfaces.secureReceiver.setHandler(
      this.eventHandler.bind(this)
    );
  }

  private eventHandler: TransportHandler<SECURE_SVM_EVENTS> = (request) => {
    const handlers: TransportHandlers<SECURE_SVM_EVENTS> = {
      SECURE_SVM_SIGN_MESSAGE: this.handleSignMessage,
      SECURE_SVM_SIGN_TX: this.handleSign,
      SECURE_SVM_SIGN_ALL_TX: this.handleSignAll,
      SECURE_SVM_CONNECT: this.handleConnect,
      SECURE_SVM_DISCONNECT: this.handleDisconnect,
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

  private handleConnect: TransportHandler<"SECURE_SVM_CONNECT"> = async (
    event
  ) => {
    const unlockResponse = await this.userClient.unlockKeyring();

    if (!unlockResponse.response) {
      return event.error(unlockResponse.error);
    }
    if (!unlockResponse.response?.unlocked) {
      return event.error("Keyring locked.");
    }

    const user = await this.userClient.getUser();

    if (!user.response) {
      return event.error(user.error);
    }

    console.log("PCA CONNECT", user);

    if (
      !user.response.user?.preferences.approvedOrigins.includes(
        event.event.origin.address
      )
    ) {
      const approvedOrigin = await this.userClient.approveOrigin({
        origin: event.event.origin.address,
      });

      if (!approvedOrigin.response) {
        return event.error(approvedOrigin.error);
      }
    }

    const publicKey = user.response.activePublicKeys?.[Blockchain.SOLANA];
    const connectionUrl = user.response.user?.preferences.solana.cluster;

    if (!publicKey) {
      return event.error("No Solana Pubkey Found");
    }
    if (!connectionUrl) {
      return event.error("No Solana connectionUrl Found");
    }

    return event.respond({
      publicKey,
      connectionUrl,
    });
  };

  private handleDisconnect: TransportHandler<"SECURE_SVM_DISCONNECT"> = async (
    event
  ) => {
    const removed = await this.userClient.removeOrigin({
      origin: event.event.origin.address,
    });
    if (!removed.response?.removed) {
      return event.error(removed.error);
    }
    return event.respond({
      disconnected: true,
    });
  };

  private handleSign: TransportHandler<"SECURE_SVM_SIGN_TX"> = async (
    event
  ) => {
    return event.error("Not Implemented");
  };

  private handleSignAll: TransportHandler<"SECURE_SVM_SIGN_ALL_TX"> = async ({
    respond,
  }) => {
    return respond({ signedTx: ["string"] });
  };
}
