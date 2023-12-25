import type { WalletDescriptor } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import { mnemonicToSeed } from "bip39";
import bs58 from "bs58";

import { safeClientResponse } from "../../background-clients/safeClientResponse";
import { SecureUIClient } from "../../background-clients/SecureUIClient";
import { hdFactoryForBlockchain } from "../../keyring";
import type { KeyringStore } from "../../store/KeyringStore/KeyringStore";
import { KeyringStoreState } from "../../types/keyring";
import type {
  SecureEventOrigin,
  TransportHandler,
  TransportReceiver,
  TransportRemoveListener,
  TransportResponder,
  TransportSender,
} from "../../types/transports";
import { LedgerClient } from "../ledger/client";
import { UserClient } from "../user/client";

import type { SECURE_SVM_EVENTS } from "./events";
import { SolanaHdKeyringFactory } from "./keyring";
import {
  deriveSolanaKeypair,
  deserializeTransaction,
  sanitizeTransactionWithFeeConfig,
} from "./util";

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
    secureUISender: TransportSender<SECURE_SVM_EVENTS, "ui">;
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
      case "SECURE_SVM_DISCONNECT":
        return this.handleDisconnect(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_SVM_PREVIEW_PUBLIC_KEYS":
        return this.handlePreviewPublicKeys(
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
      user.publicKeys?.platforms[Blockchain.SOLANA]?.activePublicKey;

    if (
      !user.preferences.approvedOrigins.includes(event.event.origin.address)
    ) {
      const approvedOrigin = await safeClientResponse(
        this.userClient.approveOrigin({
          origin: event.event.origin,
          blockchain: Blockchain.SOLANA,
        })
      );
      publicKey = approvedOrigin.publicKey;
    }

    const connectionUrl = user.preferences.blockchains.solana.connectionUrl;

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
    await safeClientResponse(
      this.userClient.removeOrigin({ origin: event.event.origin })
    );
    return event.respond({
      disconnected: true,
    });
  };

  private handlePreviewPublicKeys: TransportHandler<"SECURE_SVM_PREVIEW_PUBLIC_KEYS"> =
    async ({ request, event, respond }) => {
      const keyringStoreState = await this.keyringStore.state();
      const userKeyring =
        keyringStoreState !== KeyringStoreState.NeedsOnboarding
          ? await this.keyringStore.activeUserKeyring()
          : null;

      // no mnemonic means we're asking for hardware wallet.
      if (!request.mnemonic) {
        const ledgerResponse = await safeClientResponse(
          this.secureUIClient.confirm(event, {})
        );

        const walletDescriptors = ledgerResponse.walletDescriptors.map(
          (walletDescriptor) => {
            return {
              ...walletDescriptor,
              imported: !!userKeyring?.keyringForPublicKey(
                walletDescriptor.publicKey
              ),
            };
          }
        );
        return respond({ walletDescriptors });
      }

      let mnemonic = request.mnemonic;

      // if we're using the already existing mnemonic, get it.
      if (mnemonic === true) {
        const keyring = await this.keyringStore.activeUserKeyring();
        mnemonic = keyring.exportMnemonic();
      }

      // derive publicKeys from mnemnoic
      const seed = await mnemonicToSeed(mnemonic);
      const walletDescriptors: WalletDescriptor[] = request.derivationPaths.map(
        (derivationPath) => {
          const keypair = deriveSolanaKeypair(seed, derivationPath);
          return {
            publicKey: keypair.publicKey.toBase58(),
            derivationPath,
            blockchain: request.blockchain,
          };
        }
      );

      const newWalletDescriptors = walletDescriptors.map((walletDescriptor) => {
        return {
          ...walletDescriptor,
          imported: !!userKeyring?.keyringForPublicKey(
            walletDescriptor.publicKey
          ),
        };
      });

      return respond({ walletDescriptors: newWalletDescriptors });
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

      const blockchainKeyring = this.keyringStore
        .getUserKeyring(user.user.uuid)
        .keyringForBlockchain(Blockchain.SOLANA);

      const isLedgerWallet = !!blockchainKeyring.ledgerKeyring
        ?.publicKeys()
        .includes(publicKey);

      if (blockchainKeyring.ledgerKeyring && isLedgerWallet) {
        const ledgerRequest =
          await blockchainKeyring.ledgerKeyring.prepareSignMessage({
            message: event.request.message,
            publicKey,
          });
        const ledgerResponse = await safeClientResponse(
          this.ledgerClient.svmSignMessage(
            {
              message: ledgerRequest.signableMessage,
              derivationPath: ledgerRequest.derivationPath,
            },
            {
              origin: event.event.origin,
            }
          )
        );
        return event.respond({
          signedMessage: ledgerResponse.signature,
        });
      } else {
        const signedMessage = await blockchainKeyring.signMessage(
          event.request.message,
          publicKey
        );
        return event.respond({ signedMessage });
      }
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

    const { encoding, signature } = await this.getTransactionSignature(
      activeUser.user.uuid,
      publicKey,
      event.request.tx,
      confirmation.transactionOverrides,
      event.event.origin
    );

    return event.respond({ transactionEncoding: encoding, signature });
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
    const signatures: { transactionEncoding: string; signature: string }[] = [];

    for (let i = 0; i < request.txs.length; i++) {
      const tx = request.txs[i];
      const override = confirmation.transactionOverrides[i];
      try {
        const { encoding, signature } = await this.getTransactionSignature(
          activeUser.user.uuid,
          publicKey,
          tx,
          override,
          event.origin
        );
        signatures.push({ transactionEncoding: encoding, signature });
      } catch (e) {
        return error(e);
      }
    }

    return respond({ signatures });
  };

  private async getTransactionSignature(
    uuid: string,
    publicKey: string,
    tx: string,
    transactionOverrides: {
      disableFeeConfig: boolean;
      priorityFee: string;
      computeUnits: string;
    },
    origin: SecureEventOrigin
  ): Promise<{ encoding: string; signature: string }> {
    const blockchainKeyring = this.keyringStore
      .getUserKeyring(uuid)
      .keyringForBlockchain(Blockchain.SOLANA);

    const txStr = await sanitizeTransactionWithFeeConfig(
      tx,
      Blockchain.SOLANA,
      {
        disabled: transactionOverrides.disableFeeConfig,
        config: {
          priorityFee: BigInt(transactionOverrides.priorityFee),
          computeUnits: parseFloat(transactionOverrides.computeUnits),
        },
      }
    );

    const transaction = deserializeTransaction(txStr);
    const message = transaction.message.serialize();
    const txMessage = bs58.encode(message);

    const isLedgerWallet = !!blockchainKeyring.ledgerKeyring
      ?.publicKeys()
      .includes(publicKey);

    // If we need ledger signature, request via ledgerClient
    if (blockchainKeyring.ledgerKeyring && isLedgerWallet) {
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
        encoding: txStr,
        signature: ledgerResponse.signature,
      };
    }
    // otherwise sign with keyring
    else {
      const signature = await blockchainKeyring.signTransaction(
        txMessage,
        publicKey
      );

      return {
        encoding: txStr,
        signature,
      };
    }
  }
}
