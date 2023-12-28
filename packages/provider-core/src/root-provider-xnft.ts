import type { Event, XnftMetadata } from "@coral-xyz/common";
import {
  Blockchain,
  CHANNEL_PLUGIN_NOTIFICATION,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE,
  getLogger,
  InjectedRequestManager,
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_MOUNT,
  PLUGIN_NOTIFICATION_PUBLIC_KEY_UPDATED,
  PLUGIN_NOTIFICATION_UNMOUNT,
  PLUGIN_NOTIFICATION_UPDATE_METADATA,
  PLUGIN_RPC_METHOD_PLUGIN_OPEN,
  PLUGIN_RPC_METHOD_POP_OUT,
  PLUGIN_RPC_METHOD_RESIZE_EXTENSION_WINDOW,
} from "@coral-xyz/common";
import type {
  Commitment,
  SendOptions,
  Signer,
  SimulatedTransactionResponse,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";

import { PrivateEventEmitter } from "./common/PrivateEventEmitter";
import type { ChainedRequestManager } from "./chained-request-manager";
import { isValidEventOrigin } from ".";

const logger = getLogger("provider-xnft-injection");

//
// Injected provider for UI plugins.
//
export class ProviderRootXnftInjection extends PrivateEventEmitter {
  #requestManager: ChainedRequestManager;
  #connectionRequestManager: InjectedRequestManager;
  #publicKeys: { [blockchain: string]: string };
  #connectionUrls: { [blockchain: string]: string | null };

  #childIframes: { element: HTMLIFrameElement; id: string; url: string }[];
  #cachedNotifications: { [notification: string]: Event };
  #metadata: XnftMetadata;

  constructor(
    requestManager: ChainedRequestManager,
    additionalProperties: { [key: string]: PrivateEventEmitter } = {}
  ) {
    super();
    const additionalPropertyConfig = {};
    Object.keys(additionalProperties).forEach((prop) => {
      additionalPropertyConfig[prop] = { value: additionalProperties[prop] };
    });
    Object.defineProperties(this, additionalPropertyConfig);
    if (new.target === ProviderRootXnftInjection) {
      Object.freeze(this);
    }
    this.#requestManager = requestManager;
    this.#connectionRequestManager = new InjectedRequestManager(
      CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
      CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE
    );
    this.#childIframes = [];
    this.#cachedNotifications = {};
    this.#setupChannels();
  }

  public async openPlugin(xnftAddress: string) {
    await this.#requestManager.request({
      method: PLUGIN_RPC_METHOD_PLUGIN_OPEN,
      params: [xnftAddress],
    });
  }

  public async popout(options?: {
    fullscreen?: boolean;
    width: number;
    height: number;
  }) {
    await this.#requestManager.request({
      method: PLUGIN_RPC_METHOD_POP_OUT,
      params: [options],
    });
  }

  public async resizeExtensionWindow(width: number, height: number) {
    await this.#requestManager.request({
      method: PLUGIN_RPC_METHOD_RESIZE_EXTENSION_WINDOW,
      params: [{ width, height }],
    });
  }

  public async addIframe(iframeEl: HTMLIFrameElement, url: string, id: string) {
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

    if (this.#cachedNotifications[PLUGIN_NOTIFICATION_UPDATE_METADATA]) {
      iframeEl.contentWindow?.postMessage(
        this.#cachedNotifications[PLUGIN_NOTIFICATION_UPDATE_METADATA],
        "*"
      );
    }

    this.#requestManager.addChildIframe({
      element: iframeEl,
      url,
      id,
    });

    this.#childIframes.push({
      element: iframeEl,
      url,
      id,
    });
  }

  public async removeIframe(id) {
    // @ts-ignore
    this.#childIframes = this.#childIframes.filter((x) => x.id !== id);
    this.#requestManager.removeChildIframe(id);
  }

  #setupChannels() {
    window.addEventListener("message", this.#handleNotifications.bind(this));
  }

  //
  // Notifications from the extension UI -> plugin.
  //
  async #handleNotifications(event: Event) {
    if (!isValidEventOrigin(event)) return;
    if (event.data.type !== CHANNEL_PLUGIN_NOTIFICATION) return;

    // Send RPC message to all child iframes
    this.#childIframes.forEach(({ element }) => {
      element.contentWindow?.postMessage(event, "*");
    });

    logger.debug("root provider: handle notification", event);

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
      case PLUGIN_NOTIFICATION_PUBLIC_KEY_UPDATED:
        this.#handlePublicKeyUpdated(event);
        break;
      default:
        console.error(event);
        throw new Error("invalid notification");
    }
  }

  #handlePublicKeyUpdated(event) {
    const { publicKey, blockchain } = event.data.detail.data;
    this.#publicKeys[blockchain] = publicKey;
    this.emit("publicKeysUpdate", this.#publicKeys);
  }

  #handleConnect(event: Event) {
    this.#publicKeys = event.data.detail.data.publicKeys;
    this.#connectionUrls = event.data.detail.data.connectionUrls;

    this.emit("connect", event.data.detail);
  }

  #handleMount(event: Event) {
    this.emit("mount", event.data.detail);
  }

  #handleUpdateMetadata(event: Event) {
    this.#metadata = event.data.detail.data.metadata;
    this.emit("metadata", event.data.detail);
  }

  #handleUnmount(event: Event) {
    this.emit("unmount", event.data.detail);
  }

  async send<T extends Transaction | VersionedTransaction>(
    tx: T,
    signers?: Signer[],
    options?: SendOptions
  ): Promise<TransactionSignature> {
    // @ts-ignore
    return window.xnft.solana.send(tx, signers, options);
  }

  public async signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T> {
    // @ts-ignore
    return window.xnft.solana.signTransaction(tx);
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: Array<T>
  ): Promise<Array<T>> {
    // @ts-ignore
    return window.xnft.solana.signAllTransactions(txs);
  }

  async signMessage(msg: Uint8Array): Promise<Uint8Array> {
    // @ts-ignore
    return window.xnft.solana.signMessage(msg);
  }
  public async simulate<T extends Transaction | VersionedTransaction>(
    tx: T,
    signers?: Signer[],
    commitment?: Commitment
  ): Promise<SimulatedTransactionResponse> {
    // @ts-ignore
    return window.xnft.solana.simulate(tx, signers, commitment);
  }

  public get publicKey() {
    // @ts-ignore
    return window.xnft.solana.publicKey;
  }

  public get connection() {
    // @ts-ignore
    return window.xnft.solana.connection;
  }

  public freeze() {
    return Object.freeze(this);
  }

  public get publicKeys() {
    return this.#publicKeys;
  }

  public get connectionUrls() {
    return this.#connectionUrls;
  }

  public get metadata() {
    return this.#metadata;
  }
}
