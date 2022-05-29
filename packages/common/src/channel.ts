import type { Event, RpcRequest, RpcResponse, Notification } from "./types";
import { BrowserRuntime } from "./browser";
import { getLogger } from "./logging";
import { POST_MESSAGE_ORIGIN } from "./constants";

const logger = getLogger("common/channel");

// Channel is a class that establishes communication channel from a
// content/injected script to a background script.
export class Channel {
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

  public static client(name: string): ChannelClient {
    return new ChannelClient(name);
  }

  public static server(name: string): ChannelServer {
    return new ChannelServer(name);
  }

  public static serverPostMessage(
    reqChannel: string,
    respChannel?: string
  ): PostMessageServer {
    return new PostMessageServer(reqChannel, respChannel);
  }
}

export class ChannelClient {
  constructor(private name: string) {}

  // Sends a message to the active tab, ignoring any response.
  public sendMessageActiveTab(data: any) {
    const event = {
      channel: this.name,
      data,
    };
    BrowserRuntime.sendMessageActiveTab(event);
  }

  public sendMessageTab(tabId: number, data: any) {
    const event = {
      channel: this.name,
      data,
    };
    BrowserRuntime.sendMessageTab(tabId, event);
  }
}

export class ChannelServer {
  constructor(private name: string) {}

  public handler(
    handlerFn: (message: any, sender: any) => Promise<RpcResponse>
  ) {
    BrowserRuntime.addEventListener(
      (msg: any, sender: any, sendResponse: any) => {
        if (msg.channel === this.name) {
          const id = msg.data.id;
          handlerFn(msg, sender).then(([result, error]) => {
            sendResponse({
              id,
              result,
              error,
            });
          });
          return true;
        }
      }
    );
  }
}

export class PostMessageServer {
  private window?: any;
  constructor(
    private requestChannel: string,
    private responseChannel?: string
  ) {}

  public setWindow(window: any) {
    this.window = window;
  }

  public handler(handlerFn: (event: Event) => Promise<RpcResponse>) {
    return window.addEventListener("message", async (event: Event) => {
      if (event.data.type !== this.requestChannel) {
        return;
      }
      const id = event.data.detail.id;
      const [result, error] = await handlerFn(event);
      if (this.responseChannel) {
        const msg = {
          type: this.responseChannel,
          detail: {
            id,
            result,
            error,
          },
        };
        if (!this.window) {
          throw new Error("post message window not found");
        }
        this.window.postMessage(msg, "*");
      }
    });
  }
}

// PortChannel is like Channel, but with a persistent connection, using the
// browser's port API.
export class PortChannel {
  public static client(name: string): PortChannelClient {
    return new PortChannelClient(name);
  }

  public static server(name: string): PortChannelServer {
    return new PortChannelServer(name);
  }

  public static notifications(name: string): PortChannelNotifications {
    return new PortChannelNotifications(name);
  }
}

export class PortChannelServer {
  constructor(private name: string) {}

  public handler(handlerFn: (req: RpcRequest) => Promise<RpcResponse>) {
    BrowserRuntime.addEventListener(
      (msg: any, _sender: any, sendResponse: any) => {
        if (msg.channel !== this.name) {
          return;
        }
        const id = msg.data.id;
        handlerFn(msg.data)
          .then((resp) => {
            const [result, error] = resp;
            sendResponse({ id, result, error });
          })
          .catch((err) => {
            console.error("error here", err);
          });
        return true;
      }
    );
  }
}

export class PortChannelNotifications {
  constructor(private name: string) {}

  public onNotification(handlerFn: (notif: Notification) => void) {
    BrowserRuntime.addEventListener(
      (msg: any, _sender: any, sendResponse: any) => {
        if (msg.channel !== this.name) {
          return;
        }
        handlerFn(msg.data);
        sendResponse({ result: "success" });
      }
    );
  }
}

export class PortChannelClient implements BackgroundClient {
  private _requestId: number;
  private _responseResolvers: any;

  constructor(private name: string) {
    this._requestId = 0;
    this._responseResolvers = {};
    this._setupResponseResolvers();
  }

  private _setupResponseResolvers() {
    BrowserRuntime.addEventListener(
      (msg: any, _sender: any, sendResponse: any) => {
        if (msg.channel !== this.name) {
          return;
        }
        const { id, result, error } = msg;
        const resolver = this._responseResolvers[id];
        if (!resolver) {
          error("unexpected message", msg);
          throw new Error("unexpected message");
        }
        delete this._responseResolvers[id];
        const [resolve, reject] = resolver;
        if (error) {
          reject(error);
        }
        resolve(result);
        sendResponse({ result: "success" });
      }
    );
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

  public async request<T = any>({
    method,
    params,
  }: RpcRequest): Promise<RpcResponse<T>> {
    const id = this._requestId;
    this._requestId += 1;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [prom, resolve, reject] = this._addResponseResolver(id);
    BrowserRuntime.sendMessage(
      {
        channel: this.name,
        data: { id, method, params },
      },
      (response: any) => {
        // todo
      }
    );
    return await prom;
  }

  public async response<T = any>({
    id,
    result,
  }: RpcResponse): Promise<RpcResponse<T>> {
    BrowserRuntime.sendMessage(
      {
        channel: this.name,
        data: { id, result },
      },
      (response: any) => {
        //
      }
    );
  }
}

export interface BackgroundClient {
  request<T = any>({ method, params }: RpcRequest): Promise<RpcResponse<T>>;
  response<T = any>({ id, result }: RpcResponse): Promise<RpcResponse<T>>;
}

export class NotificationsClient {
  private sink: PortChannelClient | null = null;

  constructor(private name: string) {}

  public pushNotification(notif: Notification) {
    if (this.sink === null) {
      logger.debug("sink is null skipping notification");
      return;
    }
    BrowserRuntime.sendMessage({
      channel: this.name,
      data: notif,
    });
  }
}

type Port = any;
