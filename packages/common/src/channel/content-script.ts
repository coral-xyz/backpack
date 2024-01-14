//
// Communication channels for the injected provider (content-script) and
// the background script.
//

import { BrowserRuntimeCommon, BrowserRuntimeExtension } from "../browser";
import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  POST_MESSAGE_ORIGIN,
} from "../constants";
import type { RpcResponse, Sender } from "../types";
import { isMobile } from "../utils";
import { isValidEventOrigin } from "..";

// Channel is a class that establishes communication channel from a
// content/injected script to a background script.
export class ChannelContentScript {
  // Forwards all messages from the client to the background script.
  public static proxy(reqChannel: string, respChannel: string) {
    window.addEventListener("message", (event) => {
      if (!isValidEventOrigin(event)) {
        return;
      }
      if (event.data.type !== reqChannel) return;
      if (event.data.type === CHANNEL_SECURE_BACKGROUND_REQUEST) {
        // Verify correct origin was passed for SecureEvents
        const secureEventOrigin = event.data?.detail?.params?.[0]?.origin;
        if (
          !secureEventOrigin ||
          secureEventOrigin.address !== event.origin ||
          // this can easily change on legit websites
          // secureEventOrigin.name !== window.document.title ||
          !["browser", "xnft"].includes(secureEventOrigin.context)
        ) {
          console.error(secureEventOrigin, window.document.title, event.origin);
          throw new Error("ChannelContentScript: SecureEvent - Invalid Origin");
        }
      }

      BrowserRuntimeCommon.sendMessageToAnywhere(
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
  public static proxyReverse(reqChannel: string) {
    BrowserRuntimeCommon.addEventListenerFromAnywhere(
      (message: any, sender: Sender, sendResponse: any) => {
        if (!isMobile()) {
          //
          // Message must come from this extension's context.
          //
          if (
            globalThis.chrome?.runtime?.id &&
            sender.id !== globalThis.chrome?.runtime?.id
          ) {
            return;
          }
        }

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
    BrowserRuntimeExtension.sendMessageActiveTab(event);
  }

  public sendMessageTab(tabId: number, data: any) {
    const event = {
      channel: this.name,
      data,
    };
    BrowserRuntimeExtension.sendMessageTab(tabId, event);
  }
}

export class ChannelServer {
  constructor(private name: string) {}

  public;
  handler(
    handlerFn: (message: any, sender: Sender) => Promise<RpcResponse> | null
  ) {
    BrowserRuntimeCommon.addEventListenerFromAnywhere(
      // @ts-ignore
      (msg: any, sender: Sender, sendResponse: any) => {
        if (!isMobile()) {
          //
          // Message must come from this extension's context.
          //
          if (globalThis.chrome?.runtime?.id) {
            if (sender.id !== globalThis.chrome?.runtime?.id) {
              return;
            }
          }
        }

        if (msg.channel === this.name) {
          const id = msg.data.id;
          handlerFn(msg, sender)
            ?.then((result) => {
              sendResponse({
                id,
                result: result[0],
                error: result[1],
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
