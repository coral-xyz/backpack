//
// Communication channels for the main application UI (extension or mobile) and
// the background script.
//

import type { RpcRequest, RpcResponse, Notification } from "../types";
import { BrowserRuntimeCommon } from "../browser";
import { generateUniqueId } from "../utils";

export interface BackgroundClient {
  request<T = any>({ method, params }: RpcRequest): Promise<RpcResponse<T>>;
  response<T = any>({ id, result }: RpcResponse): Promise<RpcResponse<T>>;
}

// Note that this doesn't actually use the port API anymore and so is
// poorly name.
export class ChannelAppUi {
  public static client(name: string): ChannelAppUiClient {
    return new ChannelAppUiClient(name);
  }

  public static server(name: string): ChannelAppUiServer {
    return new ChannelAppUiServer(name);
  }

  public static notifications(name: string): ChannelAppUiNotifications {
    return new ChannelAppUiNotifications(name);
  }
}

export class ChannelAppUiServer {
  constructor(private name: string) {}

  public handler(handlerFn: (req: RpcRequest) => Promise<RpcResponse>) {
    BrowserRuntimeCommon.addEventListener(
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
            sendResponse({ id, error: err.toString() });
          });
        return true;
      }
    );
  }
}

export class ChannelAppUiNotifications {
  constructor(private name: string) {}

  public onNotification(handlerFn: (notif: Notification) => void) {
    BrowserRuntimeCommon.addEventListener(
      (msg: any, _sender: any, sendResponse: any) => {
        if (msg.channel !== this.name) {
          return;
        }
        handlerFn(msg.data);
        sendResponse({ result: "success" });
      }
    );
  }

  public pushNotification(notif: Notification) {
    BrowserRuntimeCommon.sendMessage({
      channel: this.name,
      data: notif,
    });
  }
}

export class ChannelAppUiClient implements BackgroundClient {
  constructor(private name: string) {}

  public async request<T = any>({
    method,
    params,
  }: RpcRequest): Promise<RpcResponse<T>> {
    const id = generateUniqueId();
    return new Promise((resolve, reject) => {
      BrowserRuntimeCommon.sendMessage(
        {
          channel: this.name,
          data: { id, method, params },
        },
        ({ id, result, error }: any) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        }
      );
    });
  }

  public async response<T = any>({
    id,
    result,
  }: RpcResponse): Promise<RpcResponse<T>> {
    return new Promise((resolve, reject) => {
      BrowserRuntimeCommon.sendMessage(
        {
          channel: this.name,
          data: { id, result },
        },
        (response: any) => {
          resolve(response);
        }
      );
    });
  }
}
