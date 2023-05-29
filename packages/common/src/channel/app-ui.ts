//
// Communication channels for the main application UI (extension or mobile) and
// the background script.
//

import { BrowserRuntimeCommon } from "../browser";
import type {
  Notification,
  RpcRequest,
  RpcResponse,
  RpcResponseData,
  Sender,
} from "../types";
import { generateUniqueId, isMobile } from "../utils";

export interface BackgroundClient {
  request<T = any>({ method, params }: RpcRequest): Promise<RpcResponse<T>>;
}
export type ChannelAppUiClient = ChannelClient;
export type ChannelAppUiServer = ChannelServer;
export type ChannelAppUiNotifications = ChannelNotifications;
export type ChannelAppUiResponder = ChannelResponder;

export class ChannelAppUi {
  public static client(name: string): ChannelAppUiClient {
    return new ChannelClient(name);
  }

  public static responder(name: string): ChannelAppUiResponder {
    return new ChannelResponder(name);
  }

  public static server(name: string): ChannelAppUiServer {
    return new ChannelServer(name);
  }

  public static notifications(name: string): ChannelAppUiNotifications {
    return new ChannelNotifications(name);
  }
}

class ChannelServer {
  constructor(private name: string) {}

  public handler(
    handlerFn: (req: RpcRequest, sender: Sender) => Promise<RpcResponse>
  ) {
    BrowserRuntimeCommon.addEventListenerFromAppUi(
      (msg: any, sender: Sender, sendResponse: any) => {
        if (msg.channel !== this.name) {
          return;
        }

        if (!isMobile()) {
          //
          // Message must come from the extension UI -> service worker.
          //
          if (chrome && chrome?.runtime?.id) {
            if (sender.id !== chrome.runtime.id) {
              return;
            }
          }
        }
        const id = msg.data.id;
        handlerFn(msg.data, sender)
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

class ChannelNotifications {
  constructor(public readonly name: string) {}

  public onNotification(handlerFn: (notif: Notification) => void) {
    BrowserRuntimeCommon.addEventListenerFromAppUi(
      (msg: any, sender: Sender, sendResponse: any) => {
        if (msg.channel !== this.name) {
          return;
        }

        if (!isMobile()) {
          //
          // Message must come from the extension UI -> service worker.
          //
          if (chrome && chrome?.runtime?.id) {
            if (sender.id !== chrome.runtime.id) {
              return;
            }
          }
        }

        handlerFn(msg.data);
        sendResponse({ result: "success" });
      }
    );
  }

  public pushNotification(notif: Notification) {
    BrowserRuntimeCommon.sendMessageToAppUi({
      channel: this.name,
      data: notif,
    });
  }
}

class ChannelClient implements BackgroundClient {
  constructor(public readonly name: string) {}

  public async request<T = any>({
    method,
    params,
  }: RpcRequest): Promise<RpcResponse<T>> {
    const id = generateUniqueId();
    return new Promise((resolve, reject) => {
      BrowserRuntimeCommon.sendMessageToBackground(
        {
          channel: this.name,
          data: { id, method, params },
        },
        ({ result, error }: RpcResponseData) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        }
      );
    });
  }
}

// Must be used from the frontend app code.
class ChannelResponder {
  constructor(public readonly name: string) {}

  public async response<T = any>({
    id,
    result,
  }: RpcResponse): Promise<RpcResponse<T>> {
    return new Promise((resolve) => {
      BrowserRuntimeCommon.sendMessageToBackground(
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
