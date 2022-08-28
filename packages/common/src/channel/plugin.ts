//
// Communication channels for xNFT plugins and the host.
//

import type { Event } from "@coral-xyz/common-public";
import type { RpcResponse } from "../types";

export class PluginServer {
  private window?: any;
  private url?: string;
  constructor(
    private requestChannel: string,
    private responseChannel?: string
  ) {}

  public setWindow(window: any, url: string) {
    this.window = window;
    this.url = url;
  }

  public handler(handlerFn: (event: Event) => Promise<RpcResponse>) {
    return window.addEventListener("message", async (event: Event) => {
      if (!this.url) {
        throw new Error("plugin server expected url not found");
      }
      const url = new URL(this.url);
      if (
        // TODO: hardcode allowed origin(s)
        event.origin !== url.origin ||
        event.data.href !== url.href ||
        event.data.type !== this.requestChannel
      ) {
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
