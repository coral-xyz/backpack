import { Blockchain, deserializeTransaction } from "@coral-xyz/common";
import bs58, { encode } from "bs58";

import { SecureUIClient } from "../../background-clients/SecureUIClient";
import type { KeyringStore } from "../../store/keyring";
import type {
  SecureRequest,
  TransportHandler,
  TransportHandlers,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types/transports";
import { LedgerClient } from "../ledger/client";
import { UserClient } from "../user/client";

import type { SECURE_SVM_EVENTS } from "./events";

export class SVMService {
  public destroy: TransportRemoveListener;
  private secureUIClient: SecureUIClient;
  private ledgerClient: LedgerClient;
  private userClient: UserClient;
  private keyringStore: KeyringStore;

  constructor(interfaces: {
    secureReceiver: TransportReceiver<SECURE_SVM_EVENTS>;
    secureSender: TransportSender;
    keyringStore: KeyringStore;
    secureUISender: TransportSender<SECURE_SVM_EVENTS, "uiResponse">;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureUIClient = new SecureUIClient(interfaces.secureUISender);
    this.userClient = new UserClient(interfaces.secureSender);
    this.ledgerClient = new LedgerClient(interfaces.secureUISender);
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
      const confirmation = await this.secureUIClient.confirm(event.event);

      if (confirmation.error || !confirmation.response?.confirmed) {
        return event.error("User Denied Request");
      }

      const blockchainKeyring =
        this.keyringStore.activeUserKeyring.keyringForBlockchain(
          Blockchain.SOLANA
        );

      const isLedgerWallet = !!blockchainKeyring.ledgerKeyring
        ?.publicKeys()
        .includes(event.request.publicKey);

      if (blockchainKeyring.ledgerKeyring && isLedgerWallet) {
        const ledgerRequest =
          await blockchainKeyring.ledgerKeyring.prepareSignMessage<"LEDGER_SVM_SIGN_MESSAGE">(
            event.request
          );
        const ledgerResponse = await this.ledgerClient.svmSignMessage(
          ledgerRequest
        );
        if (!ledgerResponse.response?.signature) {
          throw ledgerResponse.error;
        }
        return event.respond({
          singedMessage: ledgerResponse.response?.signature,
        });
      } else {
        const singedMessage = await blockchainKeyring.signMessage(
          event.request.message,
          event.request.publicKey
        );
        return event.respond({ singedMessage });
      }
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
    const confirmation = await this.secureUIClient.confirm(event.event);

    if (!confirmation.response?.confirmed) {
      return event.error(confirmation.error);
    }

    const signature = await this.getTransactionSignature(
      event.request.publicKey,
      event.request.tx
    );

    return event.respond({ signature });
  };

  private handleSignAll: TransportHandler<"SECURE_SVM_SIGN_ALL_TX"> = async ({
    event,
    request,
    respond,
    error,
  }) => {
    const confirmation = await this.secureUIClient.confirm(event);

    if (!confirmation.response?.confirmed) {
      return error(confirmation.error);
    }

    const signatures: string[] = [];

    for (let i = 0; i < request.txs.length; i++) {
      const tx = request.txs[i];
      try {
        const signature = await this.getTransactionSignature(
          request.publicKey,
          tx
        );
        signatures.push(signature);
      } catch (e) {
        return error(e);
      }
    }

    return respond({ signatures });
  };

  private async getTransactionSignature(
    publicKey: string,
    tx: string
  ): Promise<string> {
    const blockchainKeyring =
      this.keyringStore.activeUserKeyring.keyringForBlockchain(
        Blockchain.SOLANA
      );

    const transaction = deserializeTransaction(tx);
    const message = transaction.message.serialize();
    const txMessage = bs58.encode(message);

    const isLedgerWallet = !!blockchainKeyring.ledgerKeyring
      ?.publicKeys()
      .includes(publicKey);

    // If we need ledger signature, request via ledgerClient
    if (blockchainKeyring.ledgerKeyring && isLedgerWallet) {
      const ledgerRequest =
        await blockchainKeyring.ledgerKeyring.prepareSignTransaction<"LEDGER_SVM_SIGN_TX">(
          {
            publicKey,
            tx,
          }
        );
      const ledgerResponse = await this.ledgerClient.svmSignTransaction(
        ledgerRequest
      );
      if (!ledgerResponse.response?.signature) {
        throw ledgerResponse.error;
      }
      return ledgerResponse.response?.signature;
    }
    // otherwise sign with keyring
    else {
      const signature = await blockchainKeyring.signTransaction(
        txMessage,
        publicKey
      );
      return signature;
    }
  }
}
