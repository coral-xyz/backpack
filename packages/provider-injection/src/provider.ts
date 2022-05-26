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
  RPC_METHOD_SIGN_ALL_TXS,
  RPC_METHOD_SIGN_MESSAGE,
  RPC_METHOD_SIMULATE,
  NOTIFICATION_CONNECTED,
  NOTIFICATION_DISCONNECTED,
  NOTIFICATION_CONNECTION_URL_UPDATED,
} from "@200ms/common";
import * as cmn from "./common";

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
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.sendAndConfirm(
      this.publicKey,
      this._requestManager,
      this.connection,
      tx,
      signers,
      options
    );
  }

  async send(
    tx: Transaction,
    signers?: Signer[],
    options?: SendOptions
  ): Promise<TransactionSignature> {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.send(
      this.publicKey,
      this._requestManager,
      this.connection,
      tx,
      signers,
      options
    );
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
    return await cmn.simulate(
      this.publicKey,
      this._requestManager,
      this.connection,
      tx,
      signers,
      commitment
    );
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    return await cmn.signTransaction(this.publicKey!, this._requestManager, tx);
  }

  async signAllTransactions(
    txs: Array<Transaction>
  ): Promise<Array<Transaction>> {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signAllTransactions(
      this.publicKey,
      this._requestManager,
      txs
    );
  }

  async signMessage(msg: Uint8Array): Promise<Uint8Array | null> {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signMessage(this.publicKey, this._requestManager, msg);
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
