//
// Communication channels for xNFT plugins and the host.
//

import type { Event, RpcResponse } from "../types";

export class PluginServer {
  private window?: any;
  private destroy: () => void;
  constructor(
    private url: string,
    private requestChannel: string,
    private responseChannel?: string
  ) {
    this.destroy = () => {};
  }

  public setWindow(
    window: any,
    url: string | undefined,
    handlerFn: (event: Event) => Promise<RpcResponse>
  ) {
    this.window = window;
    this.destroy = this.handler(handlerFn);
    if (url) {
      this.url = url;
    }
  }

  public destroyWindow() {
    this.destroy();
    this.window = undefined;
  }

  private handler(
    handlerFn: (event: Event) => Promise<RpcResponse>
  ): () => void {
    const handle = async (event: Event) => {
      const url = new URL(this.url);
      const eventUrl = new URL(event.data.href);
      const isLocalhost =
        url.protocol === "http:" &&
        url.hostname === "localhost" &&
        url.port === "9933";
      if (
        // TODO: hardcode allowed origin(s)
        (!isLocalhost &&
          (eventUrl.origin !== url.origin ||
            eventUrl.pathname !== url.pathname)) ||
        event.data.type !== this.requestChannel
      ) {
        throw new Error("Unknown Origin or channel");
      }

      const id = event.data.detail.id;
      const iframeIdentifiers = event.data.iframeIdentifiers;
      const [result, error] = await handlerFn(event);
      if (this.responseChannel) {
        const msg = {
          type: this.responseChannel,
          iframeIdentifiers,
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
    };
    window.addEventListener("message", handle);

    return () => window.removeEventListener("message", handle);
  }
}
