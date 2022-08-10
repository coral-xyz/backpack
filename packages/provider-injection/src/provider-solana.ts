import { EventEmitter } from "eventemitter3";
import { Provider } from "@project-serum/anchor";
import type {
  TransactionSignature,
  ConfirmOptions,
  Transaction,
  Signer,
  SendOptions,
  SimulatedTransactionResponse,
  Commitment,
} from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import type { Event } from "@coral-xyz/common";
import {
  getLogger,
  BackgroundSolanaConnection,
  CHANNEL_SOLANA_RPC_REQUEST,
  CHANNEL_SOLANA_RPC_RESPONSE,
  CHANNEL_NOTIFICATION,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE,
  SOLANA_RPC_METHOD_CONNECT,
  SOLANA_RPC_METHOD_DISCONNECT,
  NOTIFICATION_CONNECTED,
  NOTIFICATION_DISCONNECTED,
  NOTIFICATION_CONNECTION_URL_UPDATED,
} from "@coral-xyz/common";
import * as cmn from "./common";
import { RequestManager } from "./request-manager";

const logger = getLogger("provider-injection");

export class ProviderSolanaInjection extends EventEmitter implements Provider {
  private _options?: ConfirmOptions;

  //
  // Channel to send extension specific RPC requests to the extension.
  //
  private _requestManager: RequestManager;
  //
  // Channel to send Solana Connection API requests to the extension.
  //
  private _connectionRequestManager: RequestManager;

  public isBackpack: boolean;
  public isConnected: boolean;
  public publicKey?: PublicKey;
  public connection: Connection;

  constructor() {
    super();
    this._options = undefined;
    this._requestManager = new RequestManager(
      CHANNEL_SOLANA_RPC_REQUEST,
      CHANNEL_SOLANA_RPC_RESPONSE
    );
    this._connectionRequestManager = new RequestManager(
      CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
      CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE
    );
    this._initChannels();

    this.isBackpack = true;
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

  _handleNotificationConnected(event: Event) {}

  private _connect(publicKey: string, connectionUrl: string) {
    this.isConnected = true;
    this.publicKey = new PublicKey(publicKey);
    this.connection = new BackgroundSolanaConnection(
      this._connectionRequestManager,
      connectionUrl
    );
  }

  _handleNotificationDisconnected(event: Event) {
    this.isConnected = false;
    this.connection = this.defaultConnection();
  }

  _handleNotificationConnectionUrlUpdated(event: Event) {
    this.connection = new BackgroundSolanaConnection(
      this._connectionRequestManager,
      event.data.detail.data.url
    );
  }

  async connect() {
    if (this.isConnected) {
      throw new Error("provider already connected");
    }
    // Send request to the RPC API.
    const result = await this._requestManager.request({
      method: SOLANA_RPC_METHOD_CONNECT,
      params: [],
    });

    this._connect(result.publicKey, result.connectionUrl);
  }

  async disconnect() {
    await this._requestManager.request({
      method: SOLANA_RPC_METHOD_DISCONNECT,
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
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signTransaction(this.publicKey, this._requestManager, tx);
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

  async signMessage(msg: Uint8Array): Promise<Uint8Array> {
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
      throw new Error(`unexpected notification name ${notificationName}`);
  }
}
