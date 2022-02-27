const CHANNEL_RPC_REQUEST = "anchor-rpc-request";
const CHANNEL_RPC_RESPONSE = "anchor-rpc-response";
const CHANNEL_NOTIFICATION = "anchor-notification";

const RPC_METHOD_CONNECT = "connect";
const RPC_METHOD_DISCONNECT = "disconnect";

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
    this.url = url;
    this.options = options;
    this.isConnected = false;
    this.requestId = 0;
    this.responseResolvers = {};
    this.initChannels();
  }

  initChannels() {
    // Setup channels with the content script.
    window.addEventListener(CHANNEL_RPC_RESPONSE, (event) => {
      const { id, result } = event.detail;
      const resolver = this.responseResolvers[id];
      if (!resolver) {
        error("unexpected event", event, this.responseResolvers);
        throw new Error("unexpected event");
      }
      delete this.responseResolvers[id];
      const [resolve, reject] = resolver;
      resolve(result);
    });
    window.addEventListener(
      CHANNEL_NOTIFICATION,
      this.handleNotification.bind(this)
    );
  }

  handleNotification(event) {
    switch (event.detail.name) {
      case NOTIFICATION_CONNECTED:
        this.handleNotificationConnected(event);
        break;
      case NOTIFICATION_DISCONNECTED:
        this.handleNotificationDisconnected(event);
        break;
      default:
        throw new Error(`unexpected notification ${event.detail.name}`);
    }
  }

  handleNotificationConnected(event) {
    this.isConnected = true;
    // todo
    console.log("connected!", event);
  }

  handleNotificationDisconnected(event) {
    this.isConnected = false;
    // todo
    console.log("disconnected!", event);
  }

  async send() {
    // todo
    return 2;
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

  // Sends a request from this script to the content script across the
  // window.postMessage channel.
  async request({ method, params }) {
    const id = this.requestId;
    this.requestId += 1;

    const [prom, resolve, reject] = this.addResponseResolver(id);
    window.dispatchEvent(
      new CustomEvent(CHANNEL_RPC_REQUEST, {
        detail: { id, method, params },
      })
    );
    return await prom;
  }

  // This must be called before `window.dipsatchEvent`.
  addResponseResolver(requestId) {
    let resolve, reject;
    const prom = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    this.responseResolvers[requestId] = [resolve, reject];
    return [prom, resolve, reject];
  }
}

function log(str, ...args) {
  console.log(`anchor-injected: ${str}`, ...args);
}

function error(str, ...args) {
  console.error(`anchor-injected: ${str}`, ...args);
}

main();
