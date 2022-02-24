const CHANNEL_INJECTED_REQUEST = "anchor-injected-request";
const CHANNEL_CONTENT_REQUEST = "anchor-content-request";
const CHANNEL_CONTENT_RESPONSE = "anchor-content-response";

const RPC_METHOD_CONNECT = "connect";
const RPC_METHOD_DISCONNECT = "disconnect";

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

    window.addEventListener(CHANNEL_CONTENT_RESPONSE, (event) => {
      const { id, response } = event.detail;
      const resolver = this.responseResolvers[id];
      if (!resolver) {
        error("unexpected event", event);
        throw new Error("unexpected event");
      }
      const [resolve, reject] = resolver;
      resolve(response);
    });
  }

  async send() {
    // todo
    return 2;
  }

  connect(options) {
    this.request({ method: RPC_METHOD_CONNECT, params: [] });
  }

  disconnect() {
    this.request({ method: RPC_METHOD_DISCONNECT, params: [] });
  }

  // Sends a request from this script to the content script across the
  // window.postMessage channel.
  async request({ method, params }) {
    const id = this.requestId;
    this.requestId += 1;

    const [prom, resolve, reject] = this.addResponseResolver(id);
    window.dispatchEvent(
      new CustomEvent(CHANNEL_INJECTED_REQUEST, {
        detail: { id, method, params },
      })
    );

    const response = await this.responseResolvers[id];
    delete this.responseResolvers[id];

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
