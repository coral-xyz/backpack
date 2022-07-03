import EventEmitter from "eventemitter3";
import { logFromAnywhere } from "../logging";
import { vanillaStore } from "../zustand";
import { BrowserRuntimeCommon } from "./common";
import { getLogger } from "../logging";

const logger = getLogger("common/mobile");

/**
 * Event emitter for *all* events from the web view.
 */
export const WEB_VIEW_EVENTS = new EventEmitter();

export function mobileStart() {
  // Assumes `sendMessage` is only called from the front end app code on
  // mobile.
  BrowserRuntimeCommon.sendMessage = (msg, cb) => {
    logFromAnywhere({ sendMessage: { msg, cb } });
    WebViewRequestManager.request(msg).then(cb);
  };

  // Assuemes `addEventListener` is only called from the service worker on
  // mobile.
  BrowserRuntimeCommon.addEventListener = (cb) => {
    self.addEventListener("message", (event) => {
      cb(event.data, {}, async (result) => {
        const clients = await self.clients.matchAll({
          includeUncontrolled: true,
          type: "window",
        });
        clients.forEach((client) => {
          client.postMessage({
            channel: "mobile-response",
            data: result,
          });
        });
      });
    });
  };
  BrowserRuntimeCommon.getLocalStorage = async (key: string): Promise<any> => {
    // todo
  };
  BrowserRuntimeCommon.setLocalStorage = async (
    key: string,
    value: any
  ): Promise<void> => {
    // todo
  };

  WEB_VIEW_EVENTS.on("message", (msg) => {
    logger.debug(JSON.stringify(msg));

    if (msg.channel === "mobile-response") {
      WebViewRequestManager.response(msg);
    }
  });
}

/**
 * Assumes this is called from the context of the web app to send requests to
 * the webview's service worker.
 */
class WebViewRequestManager {
  private static _resolvers: { [requestId: string]: any } = {};

  /**
   * Sends a request to the background service worker from the app ui through
   * the webview.
   */
  public static request<T = any>(msg: any): Promise<T> {
    return new Promise((resolve, reject) => {
      WebViewRequestManager._resolvers[msg.data.id] = { resolve, reject };
      vanillaStore
        .getState()
        .injectJavaScript?.(
          `window.postMessageToBackgroundViaWebview(${JSON.stringify(
            msg
          )}); true;`
        );
    });
  }

  /**
   * Resolves a given response associated with a request.
   */
  public static response({
    data,
  }: {
    data: { id: string; result: any; error?: any };
  }) {
    const resolver = WebViewRequestManager._resolvers[data.id];
    if (!resolver) {
      console.error("unable to find resolver for data", data);
      return;
    }
    delete WebViewRequestManager._resolvers[data.id];
    if (data.error) {
      resolver.reject(data.error);
    }
    resolver.resolve(data.result);
  }
}
