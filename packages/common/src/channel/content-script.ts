//
// Communication channels for the injected provider (content-script) and
// the background script.
//

import type { RpcResponse } from "../types";
import { BrowserRuntime } from "../browser";
import { POST_MESSAGE_ORIGIN } from "../constants";

// Channel is a class that establishes communication channel from a
// content/injected script to a background script.
export class ChannelContentScript {
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
          handlerFn(msg, sender)
            .then(([result, error]) => {
              sendResponse({
                id,
                result,
                error,
              });
            })
            .catch((err) => {
              sendResponse({
                id,
                error: err.toString(),
              });
            });
          return true;
        }
      }
    );
  }
}
