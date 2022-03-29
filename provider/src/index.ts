// TODO: we need to put this under the same workspace as the main package
//       so that we can share code across the extension and this package.

import {
  TransactionSignature,
  PublicKey,
  ConfirmOptions,
  Transaction,
} from "@solana/web3.js";
import * as bs58 from "bs58";
import { EventEmitter } from "eventemitter3";

const CHANNEL_RPC_REQUEST = "anchor-rpc-request";
const CHANNEL_RPC_RESPONSE = "anchor-rpc-response";
const CHANNEL_NOTIFICATION = "anchor-notification";

const RPC_METHOD_CONNECT = "connect";
const RPC_METHOD_DISCONNECT = "disconnect";
const RPC_METHOD_SIGN_AND_SEND_TX = "sign-and-send-tx";
const RPC_METHOD_SIGN_TX = "sign-tx";
const RPC_METHOD_SIGN_MESSAGE = "sign-message";
const RPC_METHOD_RECENT_BLOCKHASH = "recent-blockhash";

const NOTIFICATION_CONNECTED = "anchor-connected";
const NOTIFICATION_DISCONNECTED = "anchor-disconnected";
const NOTIFICATION_CONNECTION_URL_UPDATED = "anchor-connection-url-updated";

const POST_MESSAGE_ORIGIN = "*";

type Event = any;
type EventHandler = (notif: any) => void;
type ResponseHandler = [Function, Function];

// Script entry.
function main() {
  console.log("anchor: starting injected script");
  initProvider();
  console.log("anchor: provider ready");
}

function initProvider() {
  // @ts-ignore
  window.anchor = new Provider();
}

class Provider extends EventEmitter {
  private _url?: string;
  private _options?: ConfirmOptions;
  private _requestId: number;
  private _responseResolvers: { [requestId: number]: ResponseHandler };
  public isAnchor: boolean;
  public isConnected: boolean;
  public publicKey?: PublicKey;

  constructor() {
    super();
    this._url = undefined;
    this._options = undefined;
    this._requestId = 0;
    this._responseResolvers = {};
    this._initChannels();

    this.isAnchor = true;
    this.isConnected = false;
    this.publicKey = undefined;
  }

  // Setup channels with the content script.
  _initChannels() {
    window.addEventListener("message", this._handleRpcResponse.bind(this));
    window.addEventListener("message", this._handleNotification.bind(this));
  }

  _handleRpcResponse(event: Event) {
    if (event.data.type !== CHANNEL_RPC_RESPONSE) return;

    const { id, result } = event.data.detail;
    const resolver = this._responseResolvers[id];
    if (!resolver) {
      error("unexpected event", event);
      throw new Error("unexpected event");
    }
    delete this._responseResolvers[id];
    const [resolve, reject] = resolver;
    resolve(result);
  }

  _handleNotification(event: Event) {
    if (event.data.type !== CHANNEL_NOTIFICATION) return;
    log("notification", event);

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
    this.isConnected = true;
    this.publicKey = new PublicKey(event.data.detail.data);
  }

  _handleNotificationDisconnected(event: Event) {
    this.isConnected = false;
  }

  _handleNotificationConnectionUrlUpdated(event: Event) {
    // todo: Change connection object so that all hooks depending on it
    //       rerenders.
    console.log("got updated event", event);
  }

  async connect(onlyIfTrustedMaybe: boolean) {
    if (this.isConnected) {
      throw new Error("provider already connected");
    }

    // Send request to the RPC api.
    return await this.request({
      method: RPC_METHOD_CONNECT,
      params: [onlyIfTrustedMaybe],
    });
  }

  async disconnect() {
    return await this.request({ method: RPC_METHOD_DISCONNECT, params: [] });
  }

  async signAndSendTransaction(
    tx: Transaction
  ): Promise<TransactionSignature | null> {
    if (!this.publicKey) {
      throw new Error("wallet not connected");
    }
    const recentBlockhash = await this.request({
      method: RPC_METHOD_RECENT_BLOCKHASH,
      params: [],
    });
    tx.feePayer = this.publicKey;
    tx.recentBlockhash = recentBlockhash;
    const txSerialize = tx.serialize({
      requireAllSignatures: false,
    });
    const message = bs58.encode(txSerialize);
    return await this.request({
      method: RPC_METHOD_SIGN_AND_SEND_TX,
      params: [message, this.publicKey!.toString()],
    });
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    const recentBlockhash = await this.request({
      method: RPC_METHOD_RECENT_BLOCKHASH,
      params: [],
    });
    tx.feePayer = this.publicKey;
    tx.recentBlockhash = recentBlockhash;
    const message = bs58.encode(tx.serializeMessage());
    const signature = await this.request({
      method: RPC_METHOD_SIGN_TX,
      params: [message, this.publicKey!.toString()],
    });
    tx.addSignature(this.publicKey!, Buffer.from(bs58.decode(signature)));
    return tx;
  }

  async signAllTransactions(tx: Array<Transaction>) {
    throw new Error("not implemented please use signAndSendTransaction");
  }

  async signMessage(msg: string) {
    return await this.request({
      method: RPC_METHOD_SIGN_MESSAGE,
      params: [msg],
    });
  }

  // Sends a request from this script to the content script across the
  // window.postMessage channel.
  async request({ method, params }) {
    const id = this._requestId;
    this._requestId += 1;

    const [prom, resolve, reject] = this._addResponseResolver(id);
    window.postMessage(
      { type: CHANNEL_RPC_REQUEST, detail: { id, method, params } },
      POST_MESSAGE_ORIGIN
    );
    return await prom;
  }

  // This must be called before `window.dipsatchEvent`.
  _addResponseResolver(requestId: number) {
    let resolve, reject;
    const prom = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    this._responseResolvers[requestId] = [resolve, reject];
    return [prom, resolve, reject];
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

function log(str: string, ...args) {
  console.log(`anchor-injected: ${str}`, ...args);
}

function error(str: string, ...args) {
  console.error(`anchor-injected: ${str}`, ...args);
}

main();
