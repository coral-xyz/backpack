import EventEmitter from "eventemitter3";
import { vanillaStore } from "../zustand";
import { BrowserRuntimeCommon } from "./common";
import { getLogger } from "../logging";
import { generateUniqueId, IS_MOBILE } from "../utils";
import {
  MOBILE_CHANNEL_HOST_RPC_REQUEST,
  MOBILE_CHANNEL_HOST_RPC_RESPONSE,
  MOBILE_CHANNEL_BROWSER_RUNTIME_COMMON_RESPONSE,
} from "../constants";

const logger = getLogger("common/mobile");

/**
 * Event emitter for *all* events on the web view component.
 */
export const WEB_VIEW_EVENTS = new EventEmitter();

/**
 * Start the mobile WebView system.
 */
export function startMobileIfNeeded() {
  if (!IS_MOBILE) {
    return;
  }

  // Assumes `sendMessage` is only called from the front end app code on
  // mobile.
  BrowserRuntimeCommon.sendMessage = (msg, cb) => {
    WebViewRequestManager.request(msg).then(cb);
  };

  // Assuemes `addEventListener` is only called from the service worker on
  // mobile.
  BrowserRuntimeCommon.addEventListener = (cb) => {
    const handler = (event) => {
      cb(event.data, {}, (result: any) => {
        postMsgFromWorker({
          channel: MOBILE_CHANNEL_BROWSER_RUNTIME_COMMON_RESPONSE,
          data: result,
        });
      });
    };
    self.addEventListener("message", handler);
    return handler;
  };

  //
  // Assumes this is only called from the background service worker.
  //
  BrowserRuntimeCommon.getLocalStorage = async (key: string): Promise<any> => {
    return await rpcRequest("getLocalStorage", [key]);
  };

  //
  // Assumes this is only called from the background service worker.
  //
  BrowserRuntimeCommon.setLocalStorage = async (
    key: string,
    value: any
  ): Promise<void> => {
    // todo
  };

  BrowserRuntimeCommon.checkForError = () => {
    return undefined;
  };

  //////////////////////////////////////////////////////////////////////////////
  //
  // Handle all web view emitted events here.
  //
  //////////////////////////////////////////////////////////////////////////////

  WEB_VIEW_EVENTS.on("message", (msg) => {
    // Use the raw log to avoid an infinite loop.
    logger._log(JSON.stringify(msg));

    switch (msg.channel) {
      case MOBILE_CHANNEL_BROWSER_RUNTIME_COMMON_RESPONSE:
        WebViewRequestManager.response(msg);
        break;
      case MOBILE_CHANNEL_HOST_RPC_REQUEST:
        handleHostRpcRequest(msg);
        break;
      default:
        break;
    }
  });

  //////////////////////////////////////////////////////////////////////////////
  //
  // RPC Servers APIs.
  //
  // These APIs run in the context of the frontend react-native app code and
  // give the service worker access to resources provided by the host mobile
  // app.
  //
  //////////////////////////////////////////////////////////////////////////////

  const handleHostRpcRequest = ({
    data,
  }: {
    data: { id: string; method: string; params: Array<any> };
  }) => {
    const { id, method, params } = data;

    const [result, error] = (() => {
      switch (method) {
        case "getLocalStorage":
          return handleGetLocalStorage(params[0]);
        default:
          return [];
      }
    })();

    BrowserRuntimeCommon.sendMessage({
      channel: MOBILE_CHANNEL_HOST_RPC_RESPONSE,
      data: {
        id,
        result,
        error,
      },
    });
  };
  const handleGetLocalStorage = (key: string) => {
    return ["locked", undefined];
  };

  //////////////////////////////////////////////////////////////////////////////
  //
  // RPC Client APIs.
  //
  // These apis run in the context of the background service worker and give
  // the background script access to the frontend react-native app resources,
  // e.g., sotrage.
  //
  //////////////////////////////////////////////////////////////////////////////

  //
  // Request promise resolvers.
  //
  const RPC_RESOLVERS = {};

  //
  // Send an rpc request to the frontend app code and resolves with a promise.
  //
  const rpcRequest = (method: string, params: Array<any>): Promise<any> => {
    return new Promise((resolve, reject) => {
      const id = generateUniqueId();

      let _listener: any;
      _listener = BrowserRuntimeCommon.addEventListener(
        (
          msg: { channel: string; data: any },
          _sender: any,
          sendResponse: any
        ) => {
          //
          // Drop all irrelevant messages.
          //
          if (msg.channel !== MOBILE_CHANNEL_HOST_RPC_RESPONSE) {
            return;
          }

          //
          // Get the resolver.
          //
          const resolver = RPC_RESOLVERS[msg.data.id];
          if (!resolver) {
            logger.error(`unable to find resolver: ${JSON.stringify(msg)}`);
            return;
          }

          //
          // Cleanup the listener to avoid a memory leak.
          //
          self.removeEventListener("message", resolver.listener);

          //
          // Resolve.
          //
          const { result, error } = msg.data;
          if (error) {
            resolver.reject(error);
            return;
          }
          resolver.resolve(result);
        }
      );

      RPC_RESOLVERS[id] = { resolve, reject, listener: _listener };

      postMsgFromWorker({
        channel: MOBILE_CHANNEL_HOST_RPC_REQUEST,
        data: {
          id,
          method,
          params,
        },
      });
    });
  };
}

async function postMsgFromWorker(msg: any) {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  clients.forEach((client) => {
    client.postMessage(msg);
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
    logger.debug(JSON.stringify(msg));

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
    resolver.resolve(data);
  }
}
