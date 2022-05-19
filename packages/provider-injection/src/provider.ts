import { Provider } from "@project-serum/anchor";
import {
  TransactionSignature,
  PublicKey,
  ConfirmOptions,
  Transaction,
  Connection,
  Signer,
  SendOptions,
  SimulatedTransactionResponse,
  Commitment,
} from "@solana/web3.js";
import * as bs58 from "bs58";
import { EventEmitter } from "eventemitter3";
import {
  getLogger,
  Event,
  RequestManager,
  CHANNEL_RPC_REQUEST,
  CHANNEL_RPC_RESPONSE,
  CHANNEL_NOTIFICATION,
  RPC_METHOD_CONNECT,
  RPC_METHOD_DISCONNECT,
  RPC_METHOD_SIGN_AND_SEND_TX,
  RPC_METHOD_SIGN_TX,
  RPC_METHOD_SIGN_ALL_TXS,
  RPC_METHOD_SIGN_MESSAGE,
  RPC_METHOD_SIMULATE,
  NOTIFICATION_CONNECTED,
  NOTIFICATION_DISCONNECTED,
  NOTIFICATION_CONNECTION_URL_UPDATED,
} from "@200ms/common";

const logger = getLogger("provider-injection");

export class ProviderInjection extends EventEmitter implements Provider {
  private _url?: string;
  private _options?: ConfirmOptions;
  private _requestManager: RequestManager;

  public isAnchor: boolean;
  public isConnected: boolean;
  public publicKey?: PublicKey;
  public connection: Connection;

  constructor() {
    super();
    this._url = undefined;
    this._options = undefined;
    this._requestManager = new RequestManager(
      CHANNEL_RPC_REQUEST,
      CHANNEL_RPC_RESPONSE
    );
    this._initChannels();

    this.isAnchor = true;
    this.isConnected = false;
    this.publicKey = undefined;
    this.connection = this.defaultConnection();
  }

  defaultConnection(): Connection {
    return new Connection(
      // check rollup.config.ts for this env var
      process.env.DEFAULT_SOLANA_CONNECTION_URL ||
        "https://solana-api.projectserum.com"
    );
  }

  // Setup channels with the content script.
  _initChannels() {
    window.addEventListener("message", this._handleNotification.bind(this));
  }

  _handleNotification(event: Event) {
    if (event.data.type !== CHANNEL_NOTIFICATION) return;
    logger.debug("notification", event);

    switch (event.data.detail.name) {
      case NOTIFICATION_CONNECTED:
        this._handleNotificationConnected(event);
        break;
      case NOTIFICATION_DISCONNECTED:
        this._handleNotificationDisconnected(event);
        break;
      case NOTIFICATION_CONNECTION_URL_UPDATED:
        this._handleNotificationConnectionUrlUpdated(event);
        break;
      default:
        throw new Error(`unexpected notification ${event.data.detail.name}`);
    }

    this.emit(_mapNotificationName(event.data.detail.name));
  }

  _handleNotificationConnected(event: Event) {
    this._connect(
      event.data.detail.data.publicKey,
      event.data.detail.data.connectionUrl
    );
  }

  private _connect(publicKey: string, connectionUrl: string) {
    this.isConnected = true;
    this.publicKey = new PublicKey(publicKey);
    this.connection = new Connection(connectionUrl);
  }

  _handleNotificationDisconnected(event: Event) {
    this.isConnected = false;
  }

  _handleNotificationConnectionUrlUpdated(event: Event) {
    this.connection = new Connection(event.data.detail.data);
  }

  async connect(onlyIfTrustedMaybe: boolean) {
    if (this.isConnected) {
      throw new Error("provider already connected");
    }

    // Send request to the RPC api.
    return await this._requestManager.request({
      method: RPC_METHOD_CONNECT,
      params: [onlyIfTrustedMaybe],
    });
  }

  async disconnect() {
    await this._requestManager.request({
      method: RPC_METHOD_DISCONNECT,
      params: [],
    });
    this.connection = this.defaultConnection();
  }

  async sendAndConfirm(
    tx: Transaction,
    signers?: Signer[],
    options?: ConfirmOptions
  ): Promise<TransactionSignature> {
    const sig = await this.send(tx, signers, options);
    const resp = await this.connection?.confirmTransaction(
      sig,
      options?.commitment
    );
    if (resp?.value.err) {
      throw new Error(
        `error confirming transaction: ${resp.value.err.toString()}`
      );
    }
    return sig;
  }

  async send(
    tx: Transaction,
    signers?: Signer[],
    options?: SendOptions
  ): Promise<TransactionSignature> {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    if (signers) {
      signers.forEach((s: Signer) => {
        tx.partialSign(s);
      });
    }
    const { blockhash } = await this.connection!.getLatestBlockhash(
      options?.preflightCommitment
    );
    tx.feePayer = this.publicKey;
    tx.recentBlockhash = blockhash;
    const txSerialize = tx.serialize({
      requireAllSignatures: false,
    });
    const message = bs58.encode(txSerialize);
    return await this._requestManager.request({
      method: RPC_METHOD_SIGN_AND_SEND_TX,
      params: [message, this.publicKey!.toString(), options],
    });
  }

  async sendAll(
    _txWithSigners: { tx: Transaction; signers?: Signer[] }[],
    _opts?: ConfirmOptions
  ): Promise<Array<TransactionSignature>> {
    throw new Error("sendAll not implemented");
  }

  async simulate(
    tx: Transaction,
    signers?: Signer[],
    commitment?: Commitment
  ): Promise<SimulatedTransactionResponse> {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    if (signers) {
      signers.forEach((s: Signer) => {
        tx.partialSign(s);
      });
    }
    const { blockhash } = await this.connection!.getLatestBlockhash(commitment);
    tx.feePayer = this.publicKey;
    tx.recentBlockhash = blockhash;
    const txSerialize = tx.serialize({
      requireAllSignatures: false,
    });
    const message = bs58.encode(txSerialize);
    return await this._requestManager.request({
      method: RPC_METHOD_SIMULATE,
      params: [message, this.publicKey!.toString(), commitment],
    });
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.feePayer = this.publicKey;
    const message = bs58.encode(tx.serializeMessage());
    const signature = await this._requestManager.request({
      method: RPC_METHOD_SIGN_TX,
      params: [message, this.publicKey!.toString()],
    });
    tx.addSignature(this.publicKey!, Buffer.from(bs58.decode(signature)));
    return tx;
  }

  async signAllTransactions(
    txs: Array<Transaction>
  ): Promise<Array<Transaction>> {
    // Serialize messages.
    const messages = txs.map((tx) => {
      const txSerialized = tx.serializeMessage();
      const message = bs58.encode(txSerialized);
      return message;
    });

    // Get signatures from the background script.
    const signatures: Array<string> = await this._requestManager.request({
      method: RPC_METHOD_SIGN_ALL_TXS,
      params: [messages, this.publicKey!.toString()],
    });

    // Add the signatures to the transactions.
    txs.forEach((t, idx) => {
      t.addSignature(
        this.publicKey!,
        Buffer.from(bs58.decode(signatures[idx]))
      );
    });

    return txs;
  }

  async signMessage(msg: Uint8Array): Promise<Uint8Array | null> {
    const msgStr = bs58.encode(msg);
    const signature = await this._requestManager.request({
      method: RPC_METHOD_SIGN_MESSAGE,
      params: [msgStr, this.publicKey!.toString()],
    });
    if (!signature) {
      return signature;
    }
    return bs58.decode(signature);
  }
}

// Maps the notification name (internal) to the event name.
function _mapNotificationName(notificationName: string) {
  switch (notificationName) {
    case NOTIFICATION_CONNECTED:
      return "connect";
    case NOTIFICATION_DISCONNECTED:
      return "disconnect";
    case NOTIFICATION_CONNECTION_URL_UPDATED:
      return "connectionDidChange";
    default:
      throw new Error(`unexpected notificatoin name ${notificationName}`);
  }
}
