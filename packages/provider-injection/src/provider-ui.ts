import { EventEmitter } from "eventemitter3";
import type {
  PublicKey,
  Connection,
  Transaction,
  Signer,
  SendOptions,
  TransactionSignature,
  ConfirmOptions,
  Commitment,
  SimulatedTransactionResponse,
} from "@solana/web3.js";
import type { Provider } from "@project-serum/anchor";
import type { Event } from "@coral-xyz/common";
import {
  getLogger,
  CHANNEL_PLUGIN_NOTIFICATION,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  PLUGIN_RPC_METHOD_NAV_PUSH,
  PLUGIN_RPC_METHOD_NAV_POP,
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_ON_CLICK,
  PLUGIN_NOTIFICATION_ON_CHANGE,
  PLUGIN_NOTIFICATION_MOUNT,
  PLUGIN_NOTIFICATION_UNMOUNT,
  PLUGIN_NOTIFICATION_NAVIGATION_POP,
  PLUGIN_NOTIFICATION_CONNECTION_URL_UPDATED,
  PLUGIN_NOTIFICATION_PUBLIC_KEY_UPDATED,
} from "@coral-xyz/common";
import * as cmn from "./common";
import { RequestManager } from "./request-manager";

const logger = getLogger("provider-ui-injection");

//
// Injected provider for UI plugins.
//
export class ProviderUiInjection extends EventEmitter implements Provider {
  private _requestManager: RequestManager;

  constructor() {
    super();
    this._requestManager = new RequestManager(
      CHANNEL_PLUGIN_RPC_REQUEST,
      CHANNEL_PLUGIN_RPC_RESPONSE,
      true
    );
    this._setupChannels();
  }

  get publicKey(): PublicKey {
    return window.backpack.publicKey;
  }

  get connection(): Connection {
    return window.backpack.connection;
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
    return await cmn.signTransaction(
      window.backpack.publicKey,
      this._requestManager,
      tx
    );
  }

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

  public async navigationPush() {
    await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_NAV_PUSH,
      params: [],
    });
  }

  public async navigationPop() {
    await this._requestManager.request({
      method: PLUGIN_RPC_METHOD_NAV_POP,
      params: [],
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
      case PLUGIN_NOTIFICATION_NAVIGATION_POP:
        this._handleNavigationPop(event);
        break;
      case PLUGIN_NOTIFICATION_CONNECTION_URL_UPDATED:
        this._handleConnectionUrlUpdated(event);
        break;
      case PLUGIN_NOTIFICATION_PUBLIC_KEY_UPDATED:
        this._handlePublicKeyUpdated(event);
        break;
      default:
        console.error(event);
        throw new Error("invalid notification");
    }
  }

  private _handleConnect(event: Event) {
    const { publicKey, connectionUrl } = event.data.detail.data;
    window.backpack._connect(publicKey, connectionUrl);
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

  private _handleNavigationPop(event: Event) {
    this.emit("pop", event.data.detail);
  }

  private _handleConnectionUrlUpdated(event: Event) {
    const publicKey = window.backpack.publicKey.toString();
    const connectionUrl = event.data.detail.data.url;
    window.backpack._connect(publicKey, connectionUrl);
    this.emit("connectionUpdate", event.data.detail);
  }

  private _handlePublicKeyUpdated(event: Event) {
    const publicKey = event.data.detail.data.publicKey;
    const connectionUrl = window.backpack.connection.rpcEndpoint;
    window.backpack._connect(publicKey, connectionUrl);
    this.emit("publicKeyUpdate", event.data.detail);
  }
}
