import type { Event } from "@coral-xyz/common";
import {
  BackgroundEthereumProvider,
  Blockchain,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE,
  CHANNEL_PLUGIN_NOTIFICATION,
  getLogger,
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED,
  PLUGIN_NOTIFICATION_ETHEREUM_PUBLIC_KEY_UPDATED,
} from "@coral-xyz/common";
import type { UnsignedTransaction } from "@ethersproject/transactions";
import type { ethers } from "ethers";

import * as cmn from "./common/ethereum";
import { PrivateEventEmitter } from "./common/PrivateEventEmitter";
import type { ChainedRequestManager } from "./chained-request-manager";
import { RequestManager } from "./request-manager";
import { isValidEventOrigin } from ".";

const logger = getLogger("provider-xnft-injection");

//
// Injected provider for UI plugins.
//
export class ProviderEthereumXnftInjection extends PrivateEventEmitter {
  #requestManager: ChainedRequestManager | ChainedRequestManager;
  #connectionRequestManager: RequestManager;

  #publicKey?: string;
  #connectionUrl?: string;
  #provider?: ethers.providers.JsonRpcProvider;

  constructor(requestManager: ChainedRequestManager) {
    super();
    if (new.target === ProviderEthereumXnftInjection) {
      Object.freeze(this);
    }

    this.#requestManager = requestManager;
    this.#connectionRequestManager = new RequestManager(
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
      CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE
    );
    this.#setupChannels();
  }

  #connect(publicKey: string, connectionUrl: string) {
    this.#publicKey = publicKey;
    this.#connectionUrl = connectionUrl;
    this.#provider = new BackgroundEthereumProvider(
      this.#connectionRequestManager,
      connectionUrl
    );
  }

  async sendAndConfirmTransaction(transaction: UnsignedTransaction) {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.sendAndConfirmTransaction(
      this.#publicKey,
      this.#requestManager,
      transaction
    );
  }

  async sendTransaction(transaction: UnsignedTransaction) {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.sendTransaction(
      this.#publicKey,
      this.#requestManager,
      transaction
    );
  }

  async signTransaction(transaction: UnsignedTransaction) {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signTransaction(
      this.#publicKey,
      this.#requestManager,
      transaction
    );
  }

  async signMessage(message: string) {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signMessage(
      this.#publicKey,
      this.#requestManager,
      message
    );
  }

  #setupChannels() {
    window.addEventListener("message", this.#handleNotifications.bind(this));
  }

  async #handleNotifications(event: Event) {
    if (!isValidEventOrigin(event)) return;
    if (event.data.type !== CHANNEL_PLUGIN_NOTIFICATION) return;

    logger.debug("ethereum provider: handle notification", event);

    const { name } = event.data.detail;
    switch (name) {
      case PLUGIN_NOTIFICATION_CONNECT:
        this.#handleConnect(event);
        break;
      case PLUGIN_NOTIFICATION_ETHEREUM_CONNECTION_URL_UPDATED:
        this.#handleConnectionUrlUpdated(event);
        break;
      case PLUGIN_NOTIFICATION_ETHEREUM_PUBLIC_KEY_UPDATED:
        this.#handlePublicKeyUpdated(event);
        break;
      default:
        break;
    }
  }

  #handleConnect(event: Event) {
    const { publicKeys, connectionUrls } = event.data.detail.data;
    this.#connect(
      publicKeys[Blockchain.ETHEREUM],
      connectionUrls[Blockchain.ETHEREUM]
    );
    this.emit("connect", event.data.detail);
  }

  #handleConnectionUrlUpdated(event: Event) {
    const { connectionUrl } = event.data.detail.data;
    this.#connectionUrl = connectionUrl;
    this.#provider = new BackgroundEthereumProvider(
      this.#connectionRequestManager,
      connectionUrl
    );
    this.emit("connectionUpdate", event.data.detail);
  }

  #handlePublicKeyUpdated(event: Event) {
    const { publicKey } = event.data.detail.data;
    this.#publicKey = publicKey;
    this.emit("publicKeyUpdate", event.data.detail);
  }

  public get publicKey() {
    return this.#publicKey;
  }

  public get connectionUrl() {
    return this.#connectionUrl;
  }

  public get provider() {
    return this.#provider;
  }
}
