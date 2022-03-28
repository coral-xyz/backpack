const CHANNEL_RPC_REQUEST = "anchor-rpc-request";
const CHANNEL_RPC_RESPONSE = "anchor-rpc-response";
const CHANNEL_NOTIFICATION = "anchor-notification";

const RPC_METHOD_CONNECT = "connect";
const RPC_METHOD_DISCONNECT = "disconnect";
const RPC_METHOD_SIGN_AND_SEND_TX = "sign-and-send-tx";
const RPC_METHOD_SIGN_MESSAGE = "sign-message";

const NOTIFICATION_CONNECTED = "anchor-connected";
const NOTIFICATION_DISCONNECTED = "anchor-disconnected";
const NOTIFICATION_CONNECTION_URL_UPDATED = "anchor-connection-url-updated";

const POST_MESSAGE_ORIGIN = "*";

// Script entry.
function main() {
  log("starting injected script");
  initProvider();
  log("provider ready");
}

function initProvider() {
  window.anchor = new Provider();
}

class Provider {
  constructor() {
    this._url = undefined;
    this._options = undefined;
    this._requestId = 0;
    this._responseResolvers = {};
    this._initChannels();
    this._notificationHandlers = {};

    this.isAnchor = true;
    this.isConnected = false;
    this.publicKey = undefined;
  }

  // Setup channels with the content script.
  _initChannels() {
    window.addEventListener("message", this._handleRpcResponse.bind(this));
    window.addEventListener("message", this._handleNotification.bind(this));
  }

  _handleRpcResponse(event) {
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

  _handleNotification(event) {
    console.log("handling notif", event);
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

    const key = _mapNotificationName(event.data.detail.name);
    const handlers = this._notificationHandlers[key];
    if (handlers) {
      handlers.forEach((h) => h(event.data.detail));
    }
  }

  _handleNotificationConnected(event) {
    this.isConnected = true;
    this.publicKey = event.data.detail.data;
    console.log("got connected update", event);
  }

  _handleNotificationDisconnected(event) {
    this.isConnected = false;
  }

  _handleNotificationConnectionUrlUpdated(event) {
    // todo: Change connection object so that all hooks depending on it
    //       rerenders.
    console.log("armani: got updated event", event);
  }

  /**
   * Registers an event handler for notifications sent from the extension.
   */
  on(eventName, handler) {
    if (this._notificationHandlers[eventName]) {
      this._notificationHandlers[eventName].push(handler);
    } else {
      this._notificationHandlers[eventName] = [handler];
    }
  }

  off(eventName, listener) {
    // todo
  }

  async connect(onlyIfTrustedMaybe) {
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

  async signAndSendTransaction(tx) {
    const txSerialize = tx.serializeMessage();
    //
    console.log("tx", txSerialize);
    return await this.request({
      method: RPC_METHOD_SIGN_AND_SEND_TX,
      params: [tx],
    });
  }

  async signTransaction(tx) {
    throw new Error("not yet implemented");
  }

  async signAllTransactions(tx) {
    throw new Error("not yet implemented");
  }

  async signMessage(msg) {
    return await this.request({
      method: RPC_SIGN_MESSAGE,
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
  _addResponseResolver(requestId) {
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
function _mapNotificationName(notificationName) {
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

function log(str, ...args) {
  console.log(`anchor-injected: ${str}`, ...args);
}

function error(str, ...args) {
  console.error(`anchor-injected: ${str}`, ...args);
}

main();
