import type {
  Connection,
  Transaction,
  Signer,
  SendOptions,
  TransactionSignature,
  ConfirmOptions,
  Commitment,
  SimulatedTransactionResponse,
  VersionedTransaction,
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
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_MOUNT,
  PLUGIN_NOTIFICATION_UNMOUNT,
  PLUGIN_NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  PLUGIN_NOTIFICATION_SOLANA_PUBLIC_KEY_UPDATED,
  PLUGIN_RPC_METHOD_LOCAL_STORAGE_GET,
  PLUGIN_RPC_METHOD_LOCAL_STORAGE_PUT,
  PLUGIN_RPC_METHOD_WINDOW_OPEN,
  PLUGIN_NOTIFICATION_UPDATE_METADATA,
} from "@coral-xyz/common";
import * as cmn from "./common/solana";
import { RequestManager } from "./request-manager";
import { PrivateEventEmitter } from "./common/PrivateEventEmitter";

const logger = getLogger("provider-xnft-injection");

//
// Injected provider for UI plugins.
//
export class ProviderSolanaXnftInjection
  extends PrivateEventEmitter
  implements Provider
{
  #requestManager: RequestManager;
  #connectionRequestManager: RequestManager;

  #publicKey?: PublicKey;
  #connection: Connection;

  #childIframes: HTMLIFrameElement[];
  #cachedNotifications: { [notification: string]: Event };

  constructor(
    requestManager: RequestManager,
    additionalProperties: { [key: string]: PrivateEventEmitter } = {}
  ) {
    super();
    const additionalPropertyConfig = {};
    Object.keys(additionalProperties).forEach((prop) => {
      additionalPropertyConfig[prop] = { value: additionalProperties[prop] };
    });
    Object.defineProperties(this, additionalPropertyConfig);
    if (new.target === ProviderSolanaXnftInjection) {
      Object.freeze(this);
    }
    this.#requestManager = requestManager;
    this.#connectionRequestManager = new RequestManager(
      CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
      CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE
    );
    this.#childIframes = [];
    this.#cachedNotifications = {};
    this.#setupChannels();
  }

  #connect(publicKey: string, connectionUrl: string) {
    this.#publicKey = new PublicKey(publicKey);
    this.#connection = new BackgroundSolanaConnection(
      this.#connectionRequestManager,
      connectionUrl
    );
  }

  async sendAndConfirm<T extends Transaction | VersionedTransaction>(
    tx: T,
    signers?: Signer[],
    options?: ConfirmOptions
  ): Promise<TransactionSignature> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.sendAndConfirm(
      this.#publicKey,
      this.#requestManager,
      this.connection,
      tx,
      signers,
      options
    );
  }

  async send<T extends Transaction | VersionedTransaction>(
    tx: T,
    signers?: Signer[],
    options?: SendOptions
  ): Promise<TransactionSignature> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.send(
      this.#publicKey,
      this.#requestManager,
      this.connection,
      tx,
      signers,
      options
    );
  }

  public async signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signTransaction(
      this.#publicKey,
      this.#requestManager,
      this.connection,
      tx
    );
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: Array<T>
  ): Promise<Array<T>> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signAllTransactions(
      this.#publicKey,
      this.#requestManager,
      this.connection,
      txs
    );
  }

  async signMessage(msg: Uint8Array): Promise<Uint8Array> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signMessage(this.#publicKey, this.#requestManager, msg);
  }

  // @ts-ignore
  public async simulate<T extends Transaction | VersionedTransaction>(
    tx: T,
    signers?: Signer[],
    commitment?: Commitment
  ): Promise<SimulatedTransactionResponse> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.simulate(
      this.#publicKey,
      this.#requestManager,
      this.connection,
      tx,
      signers,
      commitment
    );
  }

  public async getStorage<T = any>(key: string): Promise<T> {
    return await this.#requestManager.request({
      method: PLUGIN_RPC_METHOD_LOCAL_STORAGE_GET,
      params: [key],
    });
  }

  public async setStorage<T = any>(key: string, val: T): Promise<void> {
    await this.#requestManager.request({
      method: PLUGIN_RPC_METHOD_LOCAL_STORAGE_PUT,
      params: [key, val],
    });
  }

  public async openWindow(url: string) {
    await this.#requestManager.request({
      method: PLUGIN_RPC_METHOD_WINDOW_OPEN,
      params: [url],
    });
  }

  public async addIframe(iframeEl) {
    // Send across mount and connect notification to child iframes
    if (this.#cachedNotifications[PLUGIN_NOTIFICATION_MOUNT]) {
      iframeEl.contentWindow?.postMessage(
        this.#cachedNotifications[PLUGIN_NOTIFICATION_MOUNT],
        "*"
      );
    }

    if (this.#cachedNotifications[PLUGIN_NOTIFICATION_CONNECT]) {
      iframeEl.contentWindow?.postMessage(
        this.#cachedNotifications[PLUGIN_NOTIFICATION_CONNECT],
        "*"
      );
    }

    this.#childIframes.push(iframeEl);
  }

  public async removeIframe(iframeEl) {
    // @ts-ignore
    this.#childIframes = this.#childIframes.filter((x) => x !== iframeEl);
  }

  #setupChannels() {
    window.addEventListener("message", this.#handleNotifications.bind(this));
  }

  //
  // Notifications from the extension UI -> plugin.
  //
  async #handleNotifications(event: Event) {
    if (event.data.type !== CHANNEL_PLUGIN_NOTIFICATION) return;

    // Send RPC message to all child iframes
    this.#childIframes.forEach((iframe) => {
      iframe.contentWindow?.postMessage(event, "*");
    });

    logger.debug("handle notification", event);

    const { name } = event.data.detail;
    this.#cachedNotifications[name] = event.data;
    switch (name) {
      case PLUGIN_NOTIFICATION_CONNECT:
        this.#handleConnect(event);
        break;
      case PLUGIN_NOTIFICATION_MOUNT:
        this.#handleMount(event);
        break;
      case PLUGIN_NOTIFICATION_UPDATE_METADATA:
        this.#handleUpdateMetadata(event);
        break;
      case PLUGIN_NOTIFICATION_UNMOUNT:
        this.#handleUnmount(event);
        break;
      case PLUGIN_NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED:
        this.#handleConnectionUrlUpdated(event);
        break;
      case PLUGIN_NOTIFICATION_SOLANA_PUBLIC_KEY_UPDATED:
        this.#handlePublicKeyUpdated(event);
        break;
      default:
        console.error(event);
        throw new Error("invalid notification");
    }
  }

  #handleConnect(event: Event) {
    const { publicKeys, connectionUrls } = event.data.detail.data;
    const publicKey = publicKeys[Blockchain.SOLANA];
    const connectionUrl = connectionUrls[Blockchain.SOLANA];
    this.#connect(publicKey, connectionUrl);
    this.emit("connect", event.data.detail);
  }

  #handleMount(event: Event) {
    this.emit("mount", event.data.detail);
  }

  #handleUpdateMetadata(event: Event) {
    this.emit("metadata", event.data.detail);
  }

  #handleUnmount(event: Event) {
    this.emit("unmount", event.data.detail);
  }

  #handleConnectionUrlUpdated(event: Event) {
    const connectionUrl = event.data.detail.data.url;
    this.#connection = new BackgroundSolanaConnection(
      this.#connectionRequestManager,
      connectionUrl
    );
    this.emit("connectionUpdate", event.data.detail);
  }

  #handlePublicKeyUpdated(event: Event) {
    const publicKey = event.data.detail.data.publicKey;
    this.#publicKey = publicKey;
    this.emit("publicKeyUpdate", event.data.detail);
  }

  public freeze() {
    return Object.freeze(this);
  }

  public get publicKey() {
    return this.#publicKey;
  }

  public get connection() {
    return this.#connection;
  }
}
