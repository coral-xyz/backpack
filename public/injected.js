const CHANNEL_RPC_REQUEST = "anchor-rpc-request";
const CHANNEL_RPC_RESPONSE = "anchor-rpc-response";
const CHANNEL_NOTIFICATION = "anchor-notification";

const RPC_METHOD_CONNECT = "connect";
const RPC_METHOD_DISCONNECT = "disconnect";
const RPC_METHOD_SIGN_AND_SEND_TX = "sign-and-send-tx";
const RPC_METHOD_SIGN_MESSAGE = "sign-message";

const NOTIFICATION_CONNECTED = "anchor-connected";
const NOTIFICATION_DISCONNECTED = "anchor-disconnected";

// Script entry.
function main() {
  log("starting injected script");
  initProvider();
  log("provider ready");
}

function initProvider() {
  window.anchor = Provider;
}

class Provider {
  constructor(url, options) {
    this._url = url;
    this._options = options;
    this._requestId = 0;
    this._responseResolvers = {};
    this._initChannels();
    this._notificationHandlers = {};

    this.isConnected = false;
  }

  _initChannels() {
    // Setup channels with the content script.
    window.addEventListener(CHANNEL_RPC_RESPONSE, (event) => {
      const { id, result } = event.detail;
      const resolver = this._responseResolvers[id];
      if (!resolver) {
        error("unexpected event", event, this._responseResolvers);
        throw new Error("unexpected event");
      }
      delete this._responseResolvers[id];
      const [resolve, reject] = resolver;
      resolve(result);
    });
    window.addEventListener(
      CHANNEL_NOTIFICATION,
      this._handleNotification.bind(this)
    );
  }

  _handleNotification(event) {
    switch (event.detail.name) {
      case NOTIFICATION_CONNECTED:
        this._handleNotificationConnected(event);
        break;
      case NOTIFICATION_DISCONNECTED:
        this._handleNotificationDisconnected(event);
        break;
      default:
        throw new Error(`unexpected notification ${event.detail.name}`);
    }
    const handlers =
      this._notificationHandlers[_mapNotificationName(event.detail.name)];
    if (handlers) {
      handlers.forEach((h) => h(event.detail));
    }
  }

  _handleNotificationConnected(event) {
    this.isConnected = true;
  }

  _handleNotificationDisconnected(event) {
    this.isConnected = false;
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
    return await this.request({
      method: RPC_SIGN_AND_SEND_TRANSCTION,
      params: [tx],
    });
  }

  async signAndSendMessage(msg) {
    return await this.request({
      method: RPC_SIGN_AND_SEND_MESSAGE,
      params: [msg],
    });
  }

  // Sends a request from this script to the content script across the
  // window.postMessage channel.
  async request({ method, params }) {
    const id = this._requestId;
    this._requestId += 1;

    const [prom, resolve, reject] = this._addResponseResolver(id);
    window.dispatchEvent(
      new CustomEvent(CHANNEL_RPC_REQUEST, {
        detail: { id, method, params },
      })
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
      return "connected";
    case NOTIFICATION_DISCONNECTED:
      return "disconnected";
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
