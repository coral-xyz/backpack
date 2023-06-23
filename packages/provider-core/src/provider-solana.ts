import type { Event } from "@coral-xyz/common";
import {
  BackgroundSolanaConnection,
  Blockchain,
  CHANNEL_PLUGIN_NOTIFICATION,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE,
  CHANNEL_SOLANA_NOTIFICATION,
  CHANNEL_SOLANA_RPC_REQUEST,
  CHANNEL_SOLANA_RPC_RESPONSE,
  DEFAULT_SOLANA_CLUSTER,
  getLogger,
  InjectedRequestManager,
  NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED,
  NOTIFICATION_SOLANA_CONNECTED,
  NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  NOTIFICATION_SOLANA_DISCONNECTED,
  PLUGIN_NOTIFICATION_CONNECT,
  PLUGIN_NOTIFICATION_MOUNT,
  PLUGIN_NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED,
  PLUGIN_NOTIFICATION_SOLANA_PUBLIC_KEY_UPDATED,
  PLUGIN_NOTIFICATION_UNMOUNT,
  PLUGIN_NOTIFICATION_UPDATE_METADATA,
  SOLANA_RPC_METHOD_CONNECT,
  SOLANA_RPC_METHOD_DISCONNECT,
  SOLANA_RPC_METHOD_OPEN_XNFT,
} from "@coral-xyz/common";
// import {
//   FromContentScriptTransportSender,
//   SolanaClient,
// } from "@coral-xyz/secure-client";
import type { Provider } from "@project-serum/anchor";
import type {
  Commitment,
  ConfirmOptions,
  SendOptions,
  Signer,
  SimulatedTransactionResponse,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { decode, encode } from "bs58";

import { PrivateEventEmitter } from "./common/PrivateEventEmitter";
import * as cmn from "./common/solana";
import { ChainedRequestManager, isValidEventOrigin } from ".";

const logger = getLogger("provider-solana-injection");

export class ProviderSolanaInjection
  extends PrivateEventEmitter
  implements Provider
{
  #options?: ConfirmOptions;

  //
  // Channel to send extension specific RPC requests to the extension.
  //
  #backpackRequestManager: InjectedRequestManager;
  // #secureSolanaClient: SolanaClient;
  #xnftRequestManager: ChainedRequestManager;

  #requestManager: InjectedRequestManager | ChainedRequestManager;
  //
  // Channel to send Solana Connection API requests to the extension.
  //
  #connectionRequestManager: InjectedRequestManager;

  #isBackpack: boolean;
  #isConnected: boolean;
  #isXnft: boolean;
  #publicKey?: PublicKey;
  #connection: Connection;
  #handlePublicKeyUpdated: any;

  constructor() {
    super();
    if (new.target === ProviderSolanaInjection) {
      Object.freeze(this);
    }
    this.#options = undefined;
    this.#backpackRequestManager = new InjectedRequestManager(
      CHANNEL_SOLANA_RPC_REQUEST,
      CHANNEL_SOLANA_RPC_RESPONSE
    );

    // this.#secureSolanaClient = new SolanaClient(
    //   new FromContentScriptTransportSender(),
    //   {
    //     context: "web",
    //     name: document.title,
    //     address: window.location.origin,
    //   }
    // );

    this.#requestManager = this.#backpackRequestManager;
    this.#connectionRequestManager = new InjectedRequestManager(
      CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
      CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE
    );
    this.#initChannels();

    this.#isBackpack = true;
    this.#isConnected = false;
    this.#publicKey = undefined;
    this.#connection = this.defaultConnection();
  }

  defaultConnection(): Connection {
    return new Connection(
      // check rollup.config.ts for this env var
      process.env.DEFAULT_SOLANA_CONNECTION_URL || DEFAULT_SOLANA_CLUSTER
    );
  }

  // Setup channels with the content script.
  #initChannels() {
    window.addEventListener("message", this.#handleNotification.bind(this));
  }

  #handleNotification(event: Event) {
    if (!isValidEventOrigin(event)) return;
    if (
      event.data.type !== CHANNEL_SOLANA_NOTIFICATION &&
      event.data.type !== CHANNEL_PLUGIN_NOTIFICATION
    )
      return;
    logger.debug("notification", event);

    switch (event.data.detail.name) {
      // BROWSER EVENTS
      case NOTIFICATION_SOLANA_CONNECTED:
        this.#handleNotificationConnected(event);
        break;
      case NOTIFICATION_SOLANA_DISCONNECTED:
        this.#handleNotificationDisconnected(event);
        break;
      case NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED:
        this.#handleNotificationConnectionUrlUpdated(event);
        break;
      case NOTIFICATION_SOLANA_ACTIVE_WALLET_UPDATED:
        this.#handleNotificationActiveWalletUpdated(event);
        break;

      // PLUGIN EVENTS
      case PLUGIN_NOTIFICATION_CONNECT:
        this.#handlePluginConnect(event);
        break;
      case PLUGIN_NOTIFICATION_MOUNT:
        this.#handlePluginMount(event);
        break;
      case PLUGIN_NOTIFICATION_UPDATE_METADATA:
        this.#handlePluginUpdateMetadata(event);
        break;
      case PLUGIN_NOTIFICATION_UNMOUNT:
        this.#handlePluginUnmount(event);
        break;
      case PLUGIN_NOTIFICATION_SOLANA_CONNECTION_URL_UPDATED:
        this.#handlePluginConnectionUrlUpdated(event);
        break;
      case PLUGIN_NOTIFICATION_SOLANA_PUBLIC_KEY_UPDATED:
        this.#handlePluginPublicKeyUpdated(event);
        break;

      default:
        throw new Error(`unexpected notification ${event.data.detail.name}`);
    }
  }

  #handlePluginConnect(event: Event) {
    const { publicKeys, connectionUrls } = event.data.detail.data;
    if (!this.#xnftRequestManager) {
      this.#xnftRequestManager = new ChainedRequestManager(
        CHANNEL_PLUGIN_RPC_REQUEST,
        CHANNEL_PLUGIN_RPC_RESPONSE
      );
    }
    this.#requestManager = this.#xnftRequestManager;
    const publicKey = publicKeys[Blockchain.SOLANA];
    const connectionUrl = connectionUrls[Blockchain.SOLANA];
    this.#isXnft = true;
    this.#connect(publicKey, connectionUrl);
    this.emit("connect", event.data.detail);
  }

  #handlePluginMount(event: Event) {
    this.emit("mount", event.data.detail);
  }

  #handlePluginUpdateMetadata(event: Event) {
    this.emit("metadata", event.data.detail);
  }

  #handlePluginUnmount(event: Event) {
    this.emit("unmount", event.data.detail);
  }

  #handlePluginConnectionUrlUpdated(event: Event) {
    const connectionUrl = event.data.detail.data.url;
    this.#connection = new BackgroundSolanaConnection(
      this.#connectionRequestManager,
      connectionUrl
    );
    this.emit("connectionDidChange", event.data.detail);
  }

  #handlePluginPublicKeyUpdated(event: Event) {
    const publicKey = event.data.detail.data.publicKey;
    this.#publicKey = publicKey;
    this.emit("publicKeyUpdate", event.data.detail);
  }

  #handleNotificationConnected(event: Event) {
    this.emit("connect", event.data.detail);
  }

  #connect(publicKey: string, connectionUrl: string) {
    this.#isConnected = true;
    this.#publicKey = new PublicKey(publicKey);
    this.#connection = new BackgroundSolanaConnection(
      this.#connectionRequestManager,
      connectionUrl
    );
  }

  #handleNotificationDisconnected(event: Event) {
    this.#isConnected = false;
    this.#connection = this.defaultConnection();
    this.emit("disconnect", event.data.detail);
  }

  #handleNotificationConnectionUrlUpdated(event: Event) {
    this.#connection = new BackgroundSolanaConnection(
      this.#connectionRequestManager,
      event.data.detail.data.url
    );
    this.emit("connectionDidChange", event.data.detail);
  }

  #handleNotificationActiveWalletUpdated(event: Event) {
    this.#publicKey = new PublicKey(event.data.detail.data.activeWallet);
    this.emit("activeWalletDidChange", event.data.detail);
  }

  async connect() {
    if (this.#isConnected) {
      throw new Error("provider already connected");
    }
    if (this.#isXnft) {
      console.warn("xnft already connected");
    }
    // Send request to the RPC API.
    const result = await this.#requestManager.request({
      method: SOLANA_RPC_METHOD_CONNECT,
      params: [],
    });

    this.#connect(result.publicKey, result.connectionUrl);
  }

  async disconnect() {
    if (this.#isXnft) {
      console.warn("xnft can't be disconnected");
    }
    await this.#requestManager.request({
      method: SOLANA_RPC_METHOD_DISCONNECT,
      params: [],
    });
    this.#connection = this.defaultConnection();
    this.#publicKey = undefined;
  }

  async openXnft(xnftAddress: string | PublicKey) {
    if (this.#isXnft) {
      throw new Error("xnft context: use window.xnft.openPlugin instead");
    }
    await this.#requestManager.request({
      method: SOLANA_RPC_METHOD_OPEN_XNFT,
      params: [xnftAddress.toString()],
    });
  }

  async sendAndConfirm<T extends Transaction | VersionedTransaction>(
    tx: T,
    signers?: Signer[],
    options?: ConfirmOptions,
    connection?: Connection,
    publicKey?: PublicKey
  ): Promise<TransactionSignature> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.sendAndConfirm(
      publicKey ?? this.#publicKey,
      this.#requestManager,
      connection ?? this.#connection,
      tx,
      signers,
      options
    );
  }

  async send<T extends Transaction | VersionedTransaction>(
    tx: T,
    signers?: Signer[],
    options?: SendOptions,
    connection?: Connection,
    publicKey?: PublicKey
  ): Promise<TransactionSignature> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.send(
      publicKey ?? this.#publicKey,
      this.#requestManager,
      connection ?? this.#connection,
      tx,
      signers,
      options
    );
  }

  // @ts-ignore
  async sendAll<T extends Transaction | VersionedTransaction>(
    _txWithSigners: { tx: T; signers?: Signer[] }[],
    _opts?: ConfirmOptions,
    connection?: Connection,
    publicKey?: PublicKey
  ): Promise<Array<TransactionSignature>> {
    throw new Error("sendAll not implemented");
  }

  // @ts-ignore
  async simulate<T extends Transaction | VersionedTransaction>(
    tx: T,
    signers?: Signer[],
    commitment?: Commitment,
    connection?: Connection,
    publicKey?: PublicKey
  ): Promise<SimulatedTransactionResponse> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.simulate(
      publicKey ?? this.#publicKey,
      this.#requestManager,
      connection ?? this.#connection,
      tx,
      signers,
      commitment
    );
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T,
    publicKey?: PublicKey,
    connection?: Connection
  ): Promise<T> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signTransaction(
      publicKey ?? this.#publicKey,
      this.#requestManager,
      connection ?? this.#connection,
      tx
    );
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: Array<T>,
    publicKey?: PublicKey,
    connection?: Connection
  ): Promise<Array<T>> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    return await cmn.signAllTransactions(
      publicKey ?? this.#publicKey,
      this.#requestManager,
      connection ?? this.#connection,
      txs
    );
  }

  async signMessage(
    msg: Uint8Array,
    publicKey?: PublicKey
  ): Promise<Uint8Array> {
    if (!this.#publicKey) {
      throw new Error("wallet not connected");
    }
    // const solanaResponse = await this.#secureSolanaClient.signMessage({
    //   publicKey: (publicKey ?? this.#publicKey).toString(),
    //   message: encode(msg),
    // });
    // if (!solanaResponse) {
    //   throw new Error("signature failed");
    // }
    // return decode(solanaResponse);
    return await cmn.signMessage(
      publicKey ?? this.#publicKey,
      this.#requestManager,
      msg
    );
  }

  public get isBackpack() {
    return this.#isBackpack;
  }

  public get isConnected() {
    return this.#isConnected;
  }

  public get isXnft() {
    return this.#isXnft;
  }

  public get publicKey() {
    return this.#publicKey;
  }

  public get connection() {
    return this.#connection;
  }
}
