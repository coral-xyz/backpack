import EventEmitter from "eventemitter3";
import { vanillaStore } from "../zustand";
import { BrowserRuntimeCommon } from "./common";
import { getLogger } from "../logging";
import { generateUniqueId, IS_MOBILE } from "../utils";
import {
  MOBILE_CHANNEL_HOST_RPC_REQUEST,
  MOBILE_CHANNEL_HOST_RPC_RESPONSE,
  MOBILE_CHANNEL_BACKGROUND_NOTIFICATIONS,
  MOBILE_CHANNEL_BROWSER_RUNTIME_COMMON_RESPONSE,
  MOBILE_CHANNEL_LOGS,
} from "../constants";

const logger = getLogger("common/mobile");

/**
 * Event emitter for *all* events on the web view component.
 */
export const WEB_VIEW_EVENTS = new EventEmitter();

function isServiceWorker(): boolean {
  return self.clients !== undefined;
}

/**
 * Start the mobile WebView system.
 */
export function startMobileIfNeeded() {
  if (!IS_MOBILE) {
    return;
  }

  const APP_UI_EVENT_LISTENERS = [] as any;

  //////////////////////////////////////////////////////////////////////////////
  //
  // Monkey patch the BrowserRuntimeCommon apis for mobile.
  //
  //////////////////////////////////////////////////////////////////////////////

  BrowserRuntimeCommon.sendMessage = (msg, cb) => {
    if (isServiceWorker()) {
      BackendRequestManager.request(msg).then(cb);
    } else {
      FrontendRequestManager.request(msg).then(cb);
    }
  };

  BrowserRuntimeCommon.addEventListener = (cb) => {
    if (isServiceWorker()) {
      const handler = (event) => {
        cb(event.data, {}, (result: any) => {
          postMsgFromWorker({
            channel: "fe-request-response",
            data: {
              wrappedResponse: result,
            },
          });
        });
      };
      self.addEventListener("message", handler);
      return handler;
    } else {
      APP_UI_EVENT_LISTENERS.push(cb);
    }
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
    return await rpcRequest("setLocalStorage", [key, value]);
  };

  BrowserRuntimeCommon.checkForError = () => {
    return undefined;
  };

  //
  //
  //
  const RESPONSE_RESOLVERS = {};

  //
  // Response channel
  //
  BrowserRuntimeCommon.addEventListener((msg, _sender, sendResponse) => {
    if (msg.channel !== "bg-request-response") {
      return;
    }
  });

  //////////////////////////////////////////////////////////////////////////////
  //
  // Handle all web view emitted events here.
  //
  //////////////////////////////////////////////////////////////////////////////

  WEB_VIEW_EVENTS.on("message", (msg: { channel: string; data: any }) => {
    // Use the raw log to avoid an infinite loop.
    logger._log(JSON.stringify(msg));

    switch (msg.channel) {
      case MOBILE_CHANNEL_LOGS:
        break;
      case MOBILE_CHANNEL_HOST_RPC_REQUEST:
        handleHostRpcRequest(msg);
        break;
      case "bg-request":
        handleBgRequest(msg);
        return;
      case "fe-request-response":
        handleFeRequestResponse(msg);
      default:
        break;
    }
  });

  const handleBgRequest = (msg) => {
    APP_UI_EVENT_LISTENERS.forEach((cb: any) => {
      cb(msg.data.wrappedMsg, {}, (result: any) => {
        vanillaStore.getState().injectJavaScript?.(
          `window.postMessageToBackgroundViaWebview(${JSON.stringify({
            channel: "bg-request-response",
            data: {
              id: msg.data.id,
              result,
            },
          })}); true;`
        );
      });
    });
  };

  const handleFeRequestResponse = (msg) => {
    FrontendRequestManager.response(msg);
  };

  //////////////////////////////////////////////////////////////////////////////
  //
  // RPC "server" APIs.
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
        case "setLocalStorage":
          return handleSetLocalStorage(params[0], params[1]);
        default:
          return [];
      }
    })();

    BrowserRuntimeCommon.sendMessage(
      {
        channel: MOBILE_CHANNEL_HOST_RPC_RESPONSE,
        data: {
          id,
          result,
          error,
        },
      },
      () => {}
    );
  };
  // TODO: replace this with whatever the react-native api is.
  const MEM_STORAGE = {
    "keyring-store": "locked",
  };
  const handleGetLocalStorage = (key: string) => {
    const result = MEM_STORAGE[key];
    return [result, undefined];
  };
  const handleSetLocalStorage = (key: string, value: any) => {
    MEM_STORAGE[key] = value;
    return ["success", undefined];
  };

  //////////////////////////////////////////////////////////////////////////////
  //
  // RPC "client" APIs.
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
class FrontendRequestManager {
  private static _resolvers: { [requestId: string]: any } = {};

  /**
   * Sends a request to the background service worker from the app ui through
   * the webview.
   */
  public static request<T = any>(msg: any): Promise<T> {
    logger.debug(JSON.stringify(msg));

    return new Promise(async (resolve, reject) => {
      FrontendRequestManager._resolvers[msg.data.id] = { resolve, reject };
      vanillaStore.getState().injectJavaScript?.(
        `window.postMessageToBackgroundViaWebview(${JSON.stringify({
          channel: "fe-request",
          data: {
            wrappedMsg: msg,
          },
        })}); true;`
      );
    });
  }

  /**
   * Resolves a given response associated with a request.
   */
  public static response({
    wrappedResponse: { data },
  }: {
    wrappedResponse: {
      data: { id: string; result: any; error?: any };
    };
  }) {
    const resolver = FrontendRequestManager._resolvers[data.id];
    if (!resolver) {
      console.error("unable to find resolver for data", data);
      return;
    }
    delete FrontendRequestManager._resolvers[data.id];
    if (data.error) {
      resolver.reject(data.error);
    }
    resolver.resolve(data);
  }
}

class BackendRequestManager {
  private static _resolvers: { [requestId: string]: any } = {};

  /**
   * Sends a request to the background service worker from the app ui through
   * the webview.
   */
  public static request<T = any>(msg: any): Promise<T> {
    logger.debug(JSON.stringify(msg));

    return new Promise(async (resolve, reject) => {
      const id = generateUniqueId();
      BackendRequestManager._resolvers[msg.data.id] = { resolve, reject };
      postMsgFromWorker({
        channel: "bg-request",
        data: {
          id,
          wrappedMsg: msg,
        },
      });
    });
  }

  /**
   * Resolves a given response associated with a request.
   */
  public static response({
    wrappedResponse: { data },
  }: {
    wrappedResponse: {
      data: { id: string; result: any; error?: any };
    };
  }) {
    const resolver = BackendRequestManager._resolvers[data.id];
    if (!resolver) {
      console.error("unable to find resolver for data", data);
      return;
    }
    delete BackendRequestManager._resolvers[data.id];
    if (data.error) {
      resolver.reject(data.error);
    }
    resolver.resolve(data);
  }
}
