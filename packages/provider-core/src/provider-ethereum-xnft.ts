import { EventEmitter } from "eventemitter3";
import { ethers } from "ethers";
import type { Event } from "@coral-xyz/common";
import { UnsignedTransaction } from "@ethersproject/transactions";
import {
  getLogger,
  BackgroundEthereumProvider,
  Blockchain,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE,
  CHANNEL_PLUGIN_NOTIFICATION,
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_ON_CLICK,
  PLUGIN_NOTIFICATION_ON_CHANGE,
  PLUGIN_NOTIFICATION_MOUNT,
  PLUGIN_NOTIFICATION_UNMOUNT,
  PLUGIN_NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  PLUGIN_NOTIFICATION_ETHEREUM_PUBLIC_KEY_UPDATED,
} from "@coral-xyz/common";
import * as cmn from "./common/ethereum";
import { RequestManager } from "./request-manager";

const logger = getLogger("provider-xnft-injection");

//
// Injected provider for UI plugins.
//
export class ProviderEthereumXnftInjection extends EventEmitter {
  private _requestManager: RequestManager;
  private _connectionRequestManager: RequestManager;

  public publicKey?: string;
  public connectionUrl?: string;
  public provider?: ethers.providers.JsonRpcProvider;

  constructor(requestManager: RequestManager) {
    super();
    this._requestManager = requestManager;
    this._connectionRequestManager = new RequestManager(
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE
    );
    this._setupChannels();
  }

  private _connect(publicKey: string, connectionUrl: string) {
    this.publicKey = publicKey;
    this.connectionUrl = connectionUrl;
    this.provider = new BackgroundEthereumProvider(
      this._connectionRequestManager,
      connectionUrl
    );
  }

  async sendAndConfirmTransaction(transaction: UnsignedTransaction) {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.sendAndConfirmTransaction(
      this.publicKey,
      this._requestManager,
      this.provider!,
      transaction
    );
  }

  async sendTransaction(transaction: UnsignedTransaction) {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.sendTransaction(
      this.publicKey,
      this._requestManager,
      this.provider!,
      transaction
    );
  }

  async signTransaction(transaction: UnsignedTransaction) {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signTransaction(
      this.publicKey,
      this._requestManager,
      this.provider!,
      transaction
    );
  }

  async signMessage(message: string) {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signMessage(this.publicKey, this._requestManager, message);
  }

  private _setupChannels() {
    window.addEventListener("message", this._handleNotifications.bind(this));
  }

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
      case PLUGIN_NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
        this._handleConnectionUrlUpdated(event);
        break;
      case PLUGIN_NOTIFICATION_ETHEREUM_PUBLIC_KEY_UPDATED:
        this._handlePublicKeyUpdated(event);
        break;
      default:
        console.error(event);
        throw new Error("invalid notification");
    }
  }

  private _handleConnect(event: Event) {
    const { publicKeys, connectionUrls } = event.data.detail.data;
    this._connect(
      publicKeys[Blockchain.ETHEREUM],
      connectionUrls[Blockchain.ETHEREUM]
    );
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
    const { connectionUrl } = event.data.detail.data;
    this.connectionUrl = connectionUrl;
    this.provider = new BackgroundEthereumProvider(
      this._connectionRequestManager,
      connectionUrl
    );
    this.emit("connectionUpdate", event.data.detail);
  }

  private _handlePublicKeyUpdated(event: Event) {
    const { publicKey } = event.data.detail.data;
    this.publicKey = publicKey;
    this.emit("publicKeyUpdate", event.data.detail);
  }
}
