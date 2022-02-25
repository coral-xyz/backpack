export const CHANNEL_RPC_REQUEST = "anchor-rpc-request";
export const CHANNEL_RPC_RESPONSE = "anchor-rpc-response";
export const CHANNEL_NOTIFICATION = "anchor-notification";

export const RPC_METHOD_CONNECT: string = "connect";
export const RPC_METHOD_DISCONNECT: string = "disconnect";

export const NOTIFICATION_CONNECTED = "anchor-connected";
export const NOTIFICATION_DISCONNECTED = "anchor-disconnected";

export function log(str: any, ...args: any) {
  console.log(`anchor: ${str}`, ...args);
}

export function error(str: any, ...args: any) {
  console.error(`anchor: ${str}`, ...args);
}

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
        chrome.runtime.sendMessage(
          {
            channel: respChannel,
            // @ts-ignore
            data: event.detail,
          },
          (resp) => {
            // no-op
          }
        );
      });
    }
    chrome.runtime.onMessage.addListener(
      (message: any, _sender: any, _sendResponse: any) => {
        if (message.channel === reqChannel) {
          window.dispatchEvent(
            new CustomEvent(reqChannel, { detail: message.data })
          );
        }
      }
    );
  }

  // Sends a message, ignoring any response.
  public sendMessage(data: any) {
    // @ts-ignore
    chrome.runtime.sendMessage(
      {
        channel: this.channel,
        data,
      },
      (_response) => {
        // Drop.
      }
    );
  }

  public handler(
    handlerFn: (message: any, sender: any, sendResponse: any) => void
  ) {
    // @ts-ignore
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.channel === this.channel) {
        handlerFn(message, sender, sendResponse);
      }
    });
  }
}
