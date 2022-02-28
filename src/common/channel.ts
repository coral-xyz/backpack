import { POST_MESSAGE_ORIGIN } from "./constants";
import { BrowserRuntime } from "./browser";
import { debug, error } from "./logging";

// Channel is a class that establishes communication channel from a
// content/injected script to a background script.
export class Channel {
  constructor(private channel: string) {}

  // Forwards all messages from the client to the background script.
  public static proxy(reqChannel: string, respChannel: string) {
    window.addEventListener("message", (event) => {
      if (event.data.type !== reqChannel) return;
      // @ts-ignore
      BrowserRuntime.sendMessage(
        {
          channel: reqChannel,
          data: event.data.detail,
        },
        (response: any) => {
          if (!response) {
            return;
          }
          window.postMessage(
            { type: respChannel, detail: response },
            POST_MESSAGE_ORIGIN
          );
        }
      );
    });
  }

  // Forwards all messages from the background script to the client.
  public static proxyReverse(reqChannel: string, respChannel?: string) {
    if (respChannel) {
      window.addEventListener("message", (event) => {
        if (event.data.type !== respChannel) return;

        BrowserRuntime.sendMessage({
          channel: respChannel,
          data: event.data.detail,
        });
      });
    }
    BrowserRuntime.addEventListener(
      (message: any, _sender: any, sendResponse: any) => {
        if (message.channel === reqChannel) {
          sendResponse({ result: "success" });
          window.postMessage(
            { type: reqChannel, detail: message.data },
            POST_MESSAGE_ORIGIN
          );
        }
      }
    );
  }

  // Sends a message to the active tab, ignoring any response.
  public sendMessageActiveTab(data: any) {
    const event = {
      channel: this.channel,
      data,
    };
    BrowserRuntime.sendMessageActiveTab(event);
  }

  public handler(
    handlerFn: (message: any, sender: any, sendResponse: any) => void
  ) {
    BrowserRuntime.addEventListener(
      (message: any, sender: any, sendResponse: any) => {
        if (message.channel === this.channel) {
          handlerFn(message, sender, sendResponse);
        }
      }
    );
  }
}

// PortChannel is like Channel, but with a persistent connection, using the
// browser's port API.
export class PortChannel {
  private _requestId: number;
  private _port: Port;
  private _responseResolvers: any;

  constructor(name: string) {
    this._port = BrowserRuntime.connect({
      name,
    });
    this._requestId = 0;
    this._responseResolvers = {};
    this._setupResponseResolvers();
  }

  private _setupResponseResolvers() {
    this._port.onMessage.addListener((msg: any) => {
      const { id, result } = msg;
      const resolver = this._responseResolvers[id];
      if (!resolver) {
        error("unexpected message", msg);
        throw new Error("unexpected message");
      }
      delete this._responseResolvers[id];
      const [resolve, reject] = resolver;
      resolve(result);
    });
  }

  public async request<T = any>({
    method,
    params,
  }: any): Promise<RpcResponse<T>> {
    const id = this._requestId;
    this._requestId += 1;

    const [prom, resolve, reject] = this._addResponseResolver(id);
    this._port.postMessage({ id, method, params });
    return await prom;
  }

  private _addResponseResolver(requestId: number): [Promise<any>, any, any] {
    let resolve, reject;
    const prom = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    this._responseResolvers[requestId] = [resolve, reject];
    return [prom, resolve, reject];
  }

  public static handler(name: string, handlerFn: (msg: any) => void) {
    chrome.runtime.onConnect.addListener((port) => {
      debug(`on connect for port ${port.name}`);
      if (port.name === name) {
        port.onMessage.addListener((msg) => {
          const id = msg.id;
          const result = handlerFn(msg);
          port.postMessage({ id, result });
        });
      }
    });
  }
}

type RpcRequest = {
  id: number;
  method: string;
  params: Array<any>;
};

type RpcResponse<T> = any;
type Port = any;
