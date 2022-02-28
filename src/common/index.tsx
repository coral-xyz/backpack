export const CHANNEL_RPC_REQUEST = "anchor-rpc-request";
export const CHANNEL_RPC_RESPONSE = "anchor-rpc-response";
export const CHANNEL_NOTIFICATION = "anchor-notification";

export const RPC_METHOD_CONNECT: string = "connect";
export const RPC_METHOD_DISCONNECT: string = "disconnect";
export const RPC_METHOD_SIGN_AND_SEND_TX: string = "sign-and-send-tx";
export const RPC_METHOD_SIGN_MESSAGE: string = "sign-message";

export const NOTIFICATION_CONNECTED = "anchor-connected";
export const NOTIFICATION_DISCONNECTED = "anchor-disconnected";

export const POST_MESSAGE_ORIGIN = "*";

export const EXTENSION_WIDTH = 357;
export const EXTENSION_HEIGHT = 600;

// Channel is a class that establishes communication channel from a content/injected script to
// a background script.
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

export function log(str: any, ...args: any) {
  console.log(`anchor: ${str}`, ...args);
}

export function debug(str: any, ...args: any) {
  log(str, ...args);
}

export function error(str: any, ...args: any) {
  console.error(`anchor: ${str}`, ...args);
}

// Chrome or firefox specific apis.
export class BrowserRuntime {
  public static sendMessage(msg: any, cb?: any) {
    // @ts-ignore
    chrome
      ? // @ts-ignore
        chrome.runtime.sendMessage(msg, cb)
      : // @ts-ignore
        browser.runtime.sendMessage(msg).then(cb);
  }

  public static addEventListener(listener: any): any {
    // @ts-ignore
    return chrome
      ? // @ts-ignore
        chrome.runtime.onMessage.addListener(listener)
      : // @ts-ignore
        browser.runtime.onmessage.addListener(listener);
  }

  public static getUrl(scriptName: string) {
    // @ts-ignore
    return chrome
      ? // @ts-ignore
        chrome.runtime.getURL(scriptName)
      : // @ts-ignore
        browser.runtime.getURL(scriptName);
  }

  public static sendMessageActiveTab(msg: any) {
    // @ts-ignore
    return chrome
      ? // @ts-ignore
        chrome.tabs.query(
          { active: true, currentWindow: true },
          (tabs: any) => {
            // @ts-ignore
            chrome.tabs.sendMessage(tabs[0].id, msg);
          }
        )
      : // @ts-ignore
        browser.tabs.query(
          { active: true, currentWindow: true },
          (tabs: any) => {
            // @ts-ignore
            browser.tabs.sendMessage(tabs[0].id, msg);
          }
        );
  }

  public static async openWindow(options: any) {
    return new Promise((resolve, reject) => {
      chrome.windows.create(options, (newWindow) => {
        // todo: firefox
        const error = BrowserRuntime.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  public static checkForError() {
    // @ts-ignore
    const { lastError } = chrome ? chrome.runtime : browser.runtime;
    if (!lastError) {
      return undefined;
    }
    if (lastError.stack && lastError.message) {
      return lastError;
    }
    return new Error(lastError.message);
  }

  public static async getLastFocusedWindow(): Promise<Window> {
    return new Promise((resolve) => {
      chrome.windows.getLastFocused(resolve);
    });
  }
}

type Window = any;
