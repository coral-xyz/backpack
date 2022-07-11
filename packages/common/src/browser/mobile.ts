import EventEmitter from "eventemitter3";
import { vanillaStore } from "../zustand";
import { BrowserRuntimeCommon } from "./common";
import { getLogger } from "../logging";
import { generateUniqueId, isServiceWorker, IS_MOBILE } from "../utils";
import {
  MOBILE_CHANNEL_HOST_RPC_REQUEST,
  MOBILE_CHANNEL_BG_REQUEST,
  MOBILE_CHANNEL_BG_RESPONSE,
  MOBILE_CHANNEL_BG_RESPONSE_INNER,
  MOBILE_CHANNEL_FE_REQUEST,
  MOBILE_CHANNEL_FE_RESPONSE,
  MOBILE_CHANNEL_FE_RESPONSE_INNER,
} from "../constants";

const logger = getLogger("common/mobile");

/**
 * Event emitter for *all* events on the web view component.
 */
export const WEB_VIEW_EVENTS = new EventEmitter();

/**
 * Holds all closure callbacks to fire when events happen.
 */
const EVENT_LISTENERS = [] as any;

/**
 * Start the mobile WebView messaging subsystem.
 *
 * Here, we patch the BrowserRuntimeCommon api so that it works on mobile,
 * passing all messages through an intermediate webview before it hits the
 * background service worker.
 */
export function startMobileIfNeeded() {
  if (!IS_MOBILE) {
    return;
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  // Handle all events here. We have a single entrypoint for both the
  // service worker and the app ui code, respectively, which then dispatches
  // to all the listener handlers.
  //
  //////////////////////////////////////////////////////////////////////////////

  if (isServiceWorker()) {
    self.addEventListener("message", (event) => {
      logger.debug("service-worker-event: ", JSON.stringify(event.data));
      EVENT_LISTENERS.forEach((handler) => handler(event.data));
    });
  } else {
    WEB_VIEW_EVENTS.on("message", (event: { channel: string; data: any }) => {
      logger._log("web-view-event:", JSON.stringify(event));
      EVENT_LISTENERS.forEach((handler) => handler(event));
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  // Monkey patch the BrowserRuntimeCommon apis for mobile.
  //
  //////////////////////////////////////////////////////////////////////////////

  BrowserRuntimeCommon.sendMessageToBackground = (msg, cb) => {
    FrontendRequestManager.request(msg).then(cb);
  };

  BrowserRuntimeCommon.sendMessageToAppUi = (msg, cb) => {
    BackendRequestManager.request(msg).then(cb);
  };

  BrowserRuntimeCommon.addEventListenerFromBackground = (cb) => {
    const handler = (event) => {
      if (event && event.data && event.data.wrappedEvent) {
        cb(event.data.wrappedEvent, {}, (result: any) => {
          postMsgFromWorker({
            channel: MOBILE_CHANNEL_FE_RESPONSE,
            data: {
              wrappedEvent: {
                channel: MOBILE_CHANNEL_FE_RESPONSE_INNER,
                data: result,
              },
            },
          });
        });
      }
    };
    EVENT_LISTENERS.push(handler);
    return handler;
  };

  BrowserRuntimeCommon.addEventListenerFromAppUi = (cb) => {
    const handler = (event) => {
      if (event && event.data && event.data.wrappedEvent) {
        cb(event.data.wrappedEvent, {}, (result: any) => {
          postMsgFromAppUi({
            channel: MOBILE_CHANNEL_BG_RESPONSE,
            data: {
              wrappedEvent: {
                channel: MOBILE_CHANNEL_BG_RESPONSE_INNER,
                data: result,
              },
            },
          });
        });
      }
    };
    EVENT_LISTENERS.push(handler);
    return handler;
  };

  BrowserRuntimeCommon.sendMessageToAnywhere = (_msg, _cb) => {
    throw new Error("sendMessageToAnywhere not implemented on mobile");
  };

  BrowserRuntimeCommon.addEventListenerFromAnywhere = (_cb) => {
    throw new Error("addEventListenerFromAnywhere not implemented on mobile");
  };

  //
  // Assumes this is only called from the background service worker.
  //
  BrowserRuntimeCommon.getLocalStorage = async (key: string): Promise<any> => {
    const { id, result, error } = await BackendRequestManager.request({
      channel: MOBILE_CHANNEL_HOST_RPC_REQUEST,
      data: {
        id: generateUniqueId(),
        method: "getLocalStorage",
        params: [key],
      },
    });
    return result;
  };

  //
  // Assumes this is only called from the background service worker.
  //
  BrowserRuntimeCommon.setLocalStorage = async (
    key: string,
    value: any
  ): Promise<void> => {
    const { id, result, error } = await BackendRequestManager.request({
      channel: MOBILE_CHANNEL_HOST_RPC_REQUEST,
      data: {
        id: generateUniqueId(),
        method: "setLocalStorage",
        params: [key, value],
      },
    });
  };

  BrowserRuntimeCommon.checkForError = () => {
    return undefined;
  };

  //////////////////////////////////////////////////////////////////////////////
  //
  // Wrapped response channels.
  //
  //////////////////////////////////////////////////////////////////////////////

  if (isServiceWorker()) {
    BrowserRuntimeCommon.addEventListenerFromBackground(
      (msg, _sender, sendResponse) => {
        if (msg.channel !== MOBILE_CHANNEL_BG_RESPONSE_INNER) {
          return;
        }
        BackendRequestManager.response(msg);
      }
    );
  } else {
    BrowserRuntimeCommon.addEventListenerFromAppUi(
      (msg, _sender, sendResponse) => {
        if (msg.channel !== MOBILE_CHANNEL_FE_RESPONSE_INNER) {
          return;
        }
        FrontendRequestManager.response(msg);
      }
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  // RPC "server" APIs.
  //
  // These APIs run in the context of the frontend react-native app code and
  // give the service worker access to resources provided by the host mobile
  // app.
  //
  //////////////////////////////////////////////////////////////////////////////

  if (!isServiceWorker()) {
    BrowserRuntimeCommon.addEventListenerFromAppUi(
      (msg, _sender, sendResponse) => {
        if (msg.channel !== MOBILE_CHANNEL_HOST_RPC_REQUEST) {
          return;
        }
        const [result, error] = handleHostRpcRequest(msg);

        sendResponse({
          id: msg.data.id,
          result,
          error,
        });
      }
    );
  }

  const handleHostRpcRequest = ({
    data,
  }: {
    data: { id: string; method: string; params: Array<any> };
  }) => {
    const { id, method, params } = data;
    switch (method) {
      case "getLocalStorage":
        return handleGetLocalStorage(params[0]);
      case "setLocalStorage":
        return handleSetLocalStorage(params[0], params[1]);
      default:
        return [];
    }
  };

  // TODO: replace this with whatever the react-native api is.
  const MEM_STORAGE = {
    // "keyring-store": "locked",
  };
  const handleGetLocalStorage = (key: string) => {
    const result = MEM_STORAGE[key];
    return [result, undefined];
  };
  const handleSetLocalStorage = (key: string, value: any) => {
    MEM_STORAGE[key] = value;
    return ["success", undefined];
  };
}

class CommonRequestManager {
  static _resolvers: { [requestId: string]: any } = {};

  /**
   * Resolves a given response associated with a request.
   */
  public static response(msg: any) {
    const {
      channel: _,
      data: { id, result, error },
    } = msg;
    const resolver = CommonRequestManager._resolvers[id];
    if (resolver === undefined) {
      logger.error("unable to find resolver for data", { id, result, error });
      return;
    }
    delete CommonRequestManager._resolvers[id];
    if (error) {
      resolver.reject(error);
    }
    resolver.resolve({ id, result, error });
  }
}

class FrontendRequestManager extends CommonRequestManager {
  public static request<T = any>(msg: any): Promise<T> {
    return new Promise((resolve, reject) => {
      CommonRequestManager._resolvers[msg.data.id] = { resolve, reject };
      postMsgFromAppUi({
        channel: MOBILE_CHANNEL_FE_REQUEST,
        data: {
          wrappedEvent: msg,
        },
      });
    });
  }
}

class BackendRequestManager extends CommonRequestManager {
  public static request<T = any>(msg: any): Promise<T> {
    return new Promise((resolve, reject) => {
      CommonRequestManager._resolvers[msg.data.id] = { resolve, reject };
      postMsgFromWorker({
        channel: MOBILE_CHANNEL_BG_REQUEST,
        data: {
          wrappedEvent: msg,
        },
      });
    });
  }
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

async function postMsgFromAppUi(msg: any) {
  vanillaStore
    .getState()
    .injectJavaScript?.(
      `window.postMessageToBackgroundViaWebview(${JSON.stringify(msg)}); true;`
    );
}
