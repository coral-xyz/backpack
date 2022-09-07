import { EventEmitter } from "eventemitter3";
import type {
  Connection,
  Transaction,
  Signer,
  SendOptions,
  TransactionSignature,
  ConfirmOptions,
  Commitment,
  SimulatedTransactionResponse,
} from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { Provider } from "@project-serum/anchor";
import type { Event } from "@coral-xyz/common";
import {
  getLogger,
  BackgroundSolanaConnection,
  Blockchain,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE,
  CHANNEL_PLUGIN_NOTIFICATION,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_ON_CLICK,
  PLUGIN_NOTIFICATION_ON_CHANGE,
  PLUGIN_NOTIFICATION_MOUNT,
  PLUGIN_NOTIFICATION_UNMOUNT,
  PLUGIN_NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  PLUGIN_NOTIFICATION_SOLANA_PUBLIC_KEY_UPDATED,
  PLUGIN_RPC_METHOD_LOCAL_STORAGE_GET,
  PLUGIN_RPC_METHOD_LOCAL_STORAGE_PUT,
} from "@coral-xyz/common";
import * as cmn from "./common/solana";
import { RequestManager } from "./request-manager";

const logger = getLogger("provider-xnft-injection");

//
// Injected provider for UI plugins.
//
export class ProviderSolanaXnftInjection
  extends EventEmitter
  implements Provider
{
  private _requestManager: RequestManager;
  private _connectionRequestManager: RequestManager;

  public publicKey?: PublicKey;
  public connection: Connection;

  constructor(requestManager: RequestManager) {
    super();
    this._requestManager = requestManager;
    this._connectionRequestManager = new RequestManager(
      CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
      CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE
    );
    this._setupChannels();
  }

  private _connect(publicKey: string, connectionUrl: string) {
    this.publicKey = new PublicKey(publicKey);
    this.connection = new BackgroundSolanaConnection(
      this._connectionRequestManager,
      connectionUrl
    );
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

  public async signTransaction(tx: Transaction): Promise<Transaction> {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signTransaction(
      this.publicKey,
      this._requestManager,
      this.connection,
      tx
    );
  }

  async signMessage(msg: Uint8Array): Promise<Uint8Array> {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signMessage(this.publicKey, this._requestManager, msg);
  }

  // @ts-ignore
  public async simulate(
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

  public async getStorage<T = any>(key: string): Promise<T> {
    return await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_LOCAL_STORAGE_GET,
      params: [key],
    });
  }

  public async setStorage<T = any>(key: string, val: T): Promise<void> {
    await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_LOCAL_STORAGE_PUT,
      params: [key, val],
    });
  }

  private _setupChannels() {
    window.addEventListener("message", this._handleNotifications.bind(this));
  }

  //
  // Notifications from the extension UI -> plugin.
  //
  private async _handleNotifications(event: Event) {
    if (event.data.type !== CHANNEL_PLUGIN_NOTIFICATION) return;

    logger.debug("handle notification", event);

    const { name } = event.data.detail;
    switch (name) {
      case PLUGIN_NOTIFICATION_CONNECT:
        this._handleConnect(event);
        break;
      case PLUGIN_NOTIFICATION_MOUNT:
        this._handleMount(event);
        break;
      case PLUGIN_NOTIFICATION_UNMOUNT:
        this._handleUnmount(event);
        break;
      case PLUGIN_NOTIFICATION_ON_CLICK:
        this._handleOnClick(event);
        break;
      case PLUGIN_NOTIFICATION_ON_CHANGE:
        this._handleOnChange(event);
        break;
      case PLUGIN_NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED:
        this._handleConnectionUrlUpdated(event);
        break;
      case PLUGIN_NOTIFICATION_SOLANA_PUBLIC_KEY_UPDATED:
        this._handlePublicKeyUpdated(event);
        break;
      default:
        console.error(event);
        throw new Error("invalid notification");
    }
  }

  private _handleConnect(event: Event) {
    const { publicKeys, connectionUrls } = event.data.detail.data;
    const publicKey = publicKeys[Blockchain.SOLANA];
    const connectionUrl = connectionUrls[Blockchain.SOLANA];
    this._connect(publicKey, connectionUrl);
    this.emit("connect", event.data.detail);
  }

  private _handleMount(event: Event) {
    this.emit("mount", event.data.detail);
  }

  private _handleUnmount(event: Event) {
    this.emit("unmount", event.data.detail);
  }

  private _handleOnClick(event: Event) {
    this.emit("click", event.data.detail);
  }

  private _handleOnChange(event: Event) {
    this.emit("change", event.data.detail);
  }

  private _handleConnectionUrlUpdated(event: Event) {
    const connectionUrl = event.data.detail.data.url;
    this.connection = new BackgroundSolanaConnection(
      this._connectionRequestManager,
      connectionUrl
    );
    this.emit("connectionUpdate", event.data.detail);
  }

  private _handlePublicKeyUpdated(event: Event) {
    const publicKey = event.data.detail.data.publicKey;
    this.publicKey = publicKey;
    this.emit("publicKeyUpdate", event.data.detail);
  }
}
