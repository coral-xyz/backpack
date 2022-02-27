export const CHANNEL_RPC_REQUEST = "anchor-rpc-request";
export const CHANNEL_RPC_RESPONSE = "anchor-rpc-response";
export const CHANNEL_NOTIFICATION = "anchor-notification";

export const RPC_METHOD_CONNECT: string = "connect";
export const RPC_METHOD_DISCONNECT: string = "disconnect";
export const RPC_METHOD_SIGN_AND_SEND_TX: string = "sign-and-send-tx";
export const RPC_METHOD_SIGN_MESSAGE: string = "sign-message";

export const NOTIFICATION_CONNECTED = "anchor-connected";
export const NOTIFICATION_DISCONNECTED = "anchor-disconnected";

export function log(str: any, ...args: any) {
  console.log(`anchor: ${str}`, ...args);
}

export function error(str: any, ...args: any) {
  console.error(`anchor: ${str}`, ...args);
}

// Channel is a class that establishes communication channel from a content/injected script to
// a background script.
export class Channel {
  constructor(private channel: string) {}

  // Forwards all messages from the client to the background script.
  public static proxy(reqChannel: string, respChannel: string) {
    window.addEventListener(reqChannel, (event) => {
      // @ts-ignore
      chrome.runtime.sendMessage(
        {
          channel: reqChannel,
          // @ts-ignore
          data: event.detail,
        },
        (response) => {
          if (!response) {
            return;
          }
          window.dispatchEvent(
            new CustomEvent(respChannel, { detail: response })
          );
        }
      );
    });
  }

  // Forwards all messages from the background script to the client.
  public static proxyReverse(reqChannel: string, respChannel?: string) {
    if (respChannel) {
      window.addEventListener(respChannel, (event) => {
        chrome.runtime.sendMessage({
          channel: respChannel,
          // @ts-ignore
          data: event.detail,
        });
      });
    }
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.channel === reqChannel) {
        sendResponse({ result: "success" });
        window.dispatchEvent(
          new CustomEvent(reqChannel, { detail: message.data })
        );
      }
    });
  }

  // Sends a message to the active tab, ignoring any response.
  public sendMessageActiveTab(data: any) {
    const event = {
      channel: this.channel,
      data,
    };
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      chrome.tabs.sendMessage(tabs[0].id, event);
    });
  }

  public handler(
    handlerFn: (message: any, sender: any, sendResponse: any) => void
  ) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.channel === this.channel) {
        handlerFn(message, sender, sendResponse);
      }
    });
  }
}
