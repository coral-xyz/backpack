import type { WalletDescriptor } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import {
  createSignInMessage,
  createSignInMessageText,
} from "@solana/wallet-standard-util";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import bs58, { decode, encode } from "bs58";

import { safeClientResponse } from "../../background-clients/safeClientResponse";
import { SecureUIClient } from "../../background-clients/SecureUIClient";
import type { KeyringStore } from "../../store/KeyringStore/KeyringStore";
import { KeyringStoreState } from "../../types/keyring";
import type { SecureUserType } from "../../types/secureUser";
import type {
  SecureEventOrigin,
  SecureRequest,
  TransportHandler,
  TransportReceiver,
  TransportRemoveListener,
  TransportResponder,
  TransportSender,
} from "../../types/transports";
import { LedgerClient } from "../ledger/client";
import { TrezorClient } from "../trezor/client";
import { UserClient } from "../user/client";

import type { SECURE_SVM_EVENTS, SECURE_SVM_SIGN_MESSAGE } from "./events";
import { deserializeTransaction } from "./util";

export class SVMService {
  public destroy: TransportRemoveListener;
  private secureUIClient: SecureUIClient;
  private ledgerClient: LedgerClient;
  private trezorClient: TrezorClient;
  private userClient: UserClient;
  private keyringStore: KeyringStore;

  constructor(interfaces: {
    secureReceiver: TransportReceiver<SECURE_SVM_EVENTS>;
    secureSender: TransportSender;
    keyringStore: KeyringStore;
    secureUISender: TransportSender<SECURE_SVM_EVENTS, "ui">;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureUIClient = new SecureUIClient(interfaces.secureUISender);
    this.userClient = new UserClient(interfaces.secureSender);
    this.ledgerClient = new LedgerClient(interfaces.secureUISender);
    this.trezorClient = new TrezorClient(interfaces.secureUISender);
    this.destroy = interfaces.secureReceiver.setHandler(
      this.eventHandler.bind(this)
    );
  }

  private eventHandler: TransportHandler<SECURE_SVM_EVENTS> = (request) => {
    switch (request.name) {
      case "SECURE_SVM_SIGN_MESSAGE":
        return this.handleSignMessage(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_SVM_SIGN_TX":
        return this.handleSign(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_SVM_SIGN_ALL_TX":
        return this.handleSignAll(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_SVM_CONNECT":
        return this.handleConnect(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_SVM_SIGN_IN":
        return this.handleSignIn(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_SVM_DISCONNECT":
        return this.handleDisconnect(
          request as TransportResponder<typeof request.name>
        );
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const missingEventCase: never = request.name;
        return Promise.resolve();
    }
  };

  private handleConnect: TransportHandler<"SECURE_SVM_CONNECT"> = async (
    event
  ) => {
    const user = await safeClientResponse(
      this.userClient.getUser({}, { origin: event.event.origin })
    );

    if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
      return event.error(new Error("No User. Needs Onboarding"));
    }

    let publicKey =
      user.publicKeys?.platforms[event.request.blockchain]?.activePublicKey;

    let approved = user.preferences.approvedOrigins.includes(
      event.event.origin.address
    );

    if (!approved && !event.request.silent) {
      const approvedOrigin = await safeClientResponse(
        this.userClient.approveOrigin({
          origin: event.event.origin,
          blockchain: event.request.blockchain,
        })
      );
      publicKey = approvedOrigin.publicKey;
      approved = approvedOrigin.approved;
    }

    const connectionUrl = user.preferences.blockchains.solana.connectionUrl;

    if (!approved) {
      return event.error(new Error("Origin not approved."));
    }
    if (!publicKey) {
      return event.error(new Error("No Solana public key Found"));
    }
    if (!connectionUrl) {
      return event.error(new Error("No Solana connection url Found"));
    }

    return event.respond({
      publicKey,
      connectionUrl,
    });
  };

  private handleDisconnect: TransportHandler<"SECURE_SVM_DISCONNECT"> = async (
    event
  ) => {
    // await safeClientResponse(
    //   this.userClient.removeOrigin({ origin: event.event.origin })
    // );
    return event.respond({
      disconnected: true,
    });
  };

  private handleSignIn: TransportHandler<"SECURE_SVM_SIGN_IN"> = async ({
    event,
    request,
    error,
    respond,
  }) => {
    const user = await safeClientResponse(this.userClient.getUser());
    if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
      return error(new Error("No active user"));
    }
    let publicKey =
      user.publicKeys?.platforms[request.blockchain]?.activePublicKey;

    if (!publicKey) {
      return error(new Error("No account for blockchain"));
    }

    if (request.input?.address) {
      publicKey = request.input.address;
      const publicKeyInfo =
        user.publicKeys?.platforms[request.blockchain]?.publicKeys[
          request.input.address
        ];
      if (!publicKeyInfo) {
        return error(new Error("Requested public key not found."));
      }
    }

    const message = createSignInMessage({
      domain: event.origin.address,
      address: publicKey,
      ...(request.input ?? {}),
    });

    const encodedMessage = encode(message);

    await safeClientResponse(
      this.secureUIClient.confirm(event, {
        message: encode(message),
        publicKey,
      })
    );

    const { signature } = await this.getMessageSignature(
      user,
      publicKey,
      encodedMessage,
      event.origin
    );

    const connectionUrl = user.preferences.blockchains.solana.connectionUrl;

    return respond({
      signedMessage: encodedMessage,
      signature,
      publicKey,
      connectionUrl,
    });
  };

  private handleSignMessage: TransportHandler<"SECURE_SVM_SIGN_MESSAGE"> =
    async (event) => {
      let publicKey = event.request.publicKey;
      if (["xnft", "browser"].includes(event.event.origin.context)) {
        const response = await safeClientResponse(
          this.userClient.approveOrigin({
            origin: event.event.origin,
            blockchain: Blockchain.SOLANA,
          })
        );
        publicKey = response.publicKey;
      }

      const user = await safeClientResponse(
        this.userClient.getUser({ uuid: event.request.uuid })
      );
      if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
        return event.error(new Error("No active user"));
      }

      await safeClientResponse(this.secureUIClient.confirm(event.event, {}));

      const { signature } = await this.getMessageSignature(
        user,
        publicKey,
        event.request.message,
        event.event.origin
      );

      return event.respond({
        signedMessage: signature,
      });
    };

  private handleSign: TransportHandler<"SECURE_SVM_SIGN_TX"> = async (
    event
  ) => {
    await safeClientResponse(
      this.userClient.unlockKeyring({}, { origin: event.event.origin })
    );

    const activeUser = await safeClientResponse(
      this.userClient.getUser({ uuid: event.request.uuid })
    );

    if (activeUser.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
      return event.error(new Error("No active user"));
    }

    let publicKey = event.request.publicKey;
    if (["xnft", "browser"].includes(event.event.origin.context)) {
      const response = await safeClientResponse(
        this.userClient.approveOrigin({
          origin: event.event.origin,
          blockchain: Blockchain.SOLANA,
        })
      );
      publicKey = publicKey ?? response.publicKey;
    }

    // dont allow UI options for events from browser or xnfts
    const uiOptions = ["browser", "xnft"].includes(event.event.origin.context)
      ? undefined
      : event.event.uiOptions;

    const confirmation = await safeClientResponse(
      this.secureUIClient.confirm(
        event.event,
        uiOptions ?? { type: "ANY" as const }
      )
    );

    const { signature } = await this.getTransactionSignature(
      activeUser,
      publicKey,
      confirmation.tx,
      event.event.origin
    );

    const signedTx = VersionedTransaction.deserialize(decode(confirmation.tx));
    signedTx.addSignature(new PublicKey(publicKey), decode(signature));

    return event.respond({ signedTx: encode(signedTx.serialize()), signature });
  };

  private handleSignAll: TransportHandler<"SECURE_SVM_SIGN_ALL_TX"> = async ({
    event,
    request,
    respond,
    error,
  }) => {
    const activeUser = await safeClientResponse(
      this.userClient.getUser({ uuid: event.request.uuid })
    );
    if (activeUser.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
      return error(new Error("No active user"));
    }
    let publicKey = request.publicKey;
    if (["xnft", "browser"].includes(event.origin.context)) {
      const response = await safeClientResponse(
        this.userClient.approveOrigin({
          origin: event.origin,
          blockchain: Blockchain.SOLANA,
        })
      );
      publicKey = response.publicKey;
    }
    const confirmation = await safeClientResponse(
      this.secureUIClient.confirm(event, {})
    );
    const signatures: { signedTx: string; signature: string }[] = [];

    for (let i = 0; i < request.txs.length; i++) {
      const tx = confirmation.txs[i];
      try {
        const { signature } = await this.getTransactionSignature(
          activeUser,
          publicKey,
          tx,
          event.origin
        );
        const signedTx = VersionedTransaction.deserialize(decode(tx));
        signedTx.addSignature(new PublicKey(publicKey), decode(signature));
        signatures.push({ signedTx: encode(signedTx.serialize()), signature });
      } catch (e) {
        console.error(e);
        return error(e);
      }
    }

    return respond({ signatures });
  };

  private async getTransactionSignature(
    user: SecureUserType,
    publicKey: string,
    tx: string,
    origin: SecureEventOrigin
  ): Promise<{ signature: string }> {
    const blockchainKeyring = this.keyringStore
      .getUserKeyring(user.user.uuid)
      ?.keyringForBlockchain(Blockchain.SOLANA);

    if (!blockchainKeyring) {
      throw new Error("invariant violation: BlockchainKeyring not found");
    }

    const isLedgerWallet = !!blockchainKeyring.ledgerKeyring
      ?.publicKeys()
      .includes(publicKey);

    const isTrezorWallet = !!blockchainKeyring.trezorKeyring
      ?.publicKeys()
      .includes(publicKey);

    // If we need ledger signature, request via ledgerClient
    if (blockchainKeyring.trezorKeyring && isTrezorWallet) {
      const trezorRequest =
        await blockchainKeyring.trezorKeyring.prepareSignTransaction({
          publicKey,
          tx,
        });

      const trezorResponse = await safeClientResponse(
        this.trezorClient.svmSignTransaction(
          {
            txMessage: trezorRequest.signableTx,
            derivationPath: trezorRequest.derivationPath,
          },
          { origin }
        )
      );

      return {
        signature: trezorResponse.signature,
      };
    } else if (blockchainKeyring.ledgerKeyring && isLedgerWallet) {
      const ledgerRequest =
        await blockchainKeyring.ledgerKeyring.prepareSignTransaction({
          publicKey,
          tx,
        });

      const ledgerResponse = await safeClientResponse(
        this.ledgerClient.svmSignTransaction(
          {
            txMessage: ledgerRequest.signableTx,
            derivationPath: ledgerRequest.derivationPath,
          },
          { origin }
        )
      );

      return {
        signature: ledgerResponse.signature,
      };
    }
    // otherwise sign with keyring
    else {
      const transaction = deserializeTransaction(tx);
      const message = transaction.message.serialize();
      const txMessage = bs58.encode(message);

      const signature = await blockchainKeyring.signTransaction(
        txMessage,
        publicKey
      );

      return {
        signature,
      };
    }
  }
  private async getMessageSignature(
    user: SecureUserType,
    publicKey: string,
    message: string,
    origin: SecureEventOrigin
  ): Promise<{ signature: string }> {
    const blockchainKeyring = this.keyringStore
      .getUserKeyring(user.user.uuid)
      ?.keyringForBlockchain(Blockchain.SOLANA);

    if (!blockchainKeyring) {
      throw new Error("invariant violation: BlockchainKeyring not found");
    }

    const isLedgerWallet = !!blockchainKeyring.ledgerKeyring
      ?.publicKeys()
      .includes(publicKey);

    if (blockchainKeyring.ledgerKeyring && isLedgerWallet) {
      const ledgerRequest =
        await blockchainKeyring.ledgerKeyring.prepareSignMessage({
          message: message,
          publicKey,
        });
      const ledgerResponse = await safeClientResponse(
        this.ledgerClient.svmSignMessage(
          {
            message: ledgerRequest.signableMessage,
            derivationPath: ledgerRequest.derivationPath,
          },
          {
            origin,
          }
        )
      );
      return { signature: ledgerResponse.signature };
    } else {
      const signature = await blockchainKeyring.signMessage(message, publicKey);
      return { signature };
    }
  }
}
