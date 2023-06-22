import EventEmitter from "eventemitter3";

import {
  MOBILE_CHANNEL_BG_REQUEST,
  MOBILE_CHANNEL_BG_RESPONSE,
  MOBILE_CHANNEL_BG_RESPONSE_INNER,
  MOBILE_CHANNEL_FE_REQUEST,
  MOBILE_CHANNEL_FE_RESPONSE,
  MOBILE_CHANNEL_FE_RESPONSE_INNER,
  MOBILE_CHANNEL_HOST_RPC_REQUEST,
} from "../constants";
import { getLogger } from "../logging";
import type { RpcRequestMsg, RpcResponseData } from "../types";
import { generateUniqueId, IS_MOBILE, isServiceWorker } from "../utils";
import { useStore } from "../zustand-store";

import { SecureStorage } from "./AsyncStorage";
import { BrowserRuntimeCommon } from "./common";

const logger = getLogger("common/mobile");

type Result = any;
type Response = {
  id: string;
  result: Result;
  error: any;
};

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
      EVENT_LISTENERS.forEach((handler: any) => handler(event.data));
    });
  } else {
    WEB_VIEW_EVENTS.on("message", (event: { channel: string; data: any }) => {
      logger._log("web-view-event:", JSON.stringify(event));
      EVENT_LISTENERS.forEach((handler: any) => handler(event));
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  // Monkey patch the BrowserRuntimeCommon apis for mobile.
  //
  //////////////////////////////////////////////////////////////////////////////

  // the actual app -> service worker
  // on the client this is powered by chrome.runtime.sendMessage, so we try to recreate that here
  // See FrontendRequestManager.request
  BrowserRuntimeCommon.sendMessageToBackground = (
    msg: RpcRequestMsg,
    cb: (res: RpcResponseData) => void
  ) => {
    return FrontendRequestManager.request(msg)
      .then(cb)
      .catch((error) => {
        cb({ error });
      });
  };

  // from the service worker -> app
  // on the client this is powered by chrome.runtime.sendMessage, so we try to recreate that here
  // See BackendRequestManager.request
  BrowserRuntimeCommon.sendMessageToAppUi = (
    msg: RpcRequestMsg,
    cb: (res: RpcResponseData) => void
  ) => {
    return BackendRequestManager.request(msg)
      .then(cb)
      .catch((error) => {
        cb({ error });
      });
  };

  BrowserRuntimeCommon.addEventListenerFromBackground = (cb) => {
    const handler = (event: any) => {
      if (event && event.data && event.data.wrappedEvent) {
        cb(event.data.wrappedEvent, {}, (result: any) => {
          // eslint-disable-next-line
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
    const handler = (event: any) => {
      if (event && event.data && event.data.wrappedEvent) {
        cb(event.data.wrappedEvent, {}, (result: any) => {
          // eslint-disable-next-line
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

  // eslint-disable-next-line
  BrowserRuntimeCommon.sendMessageToAnywhere = (_msg, _cb) => {
    throw new Error("sendMessageToAnywhere not implemented on mobile");
  };

  // eslint-disable-next-line
  BrowserRuntimeCommon.addEventListenerFromAnywhere = (_cb) => {
    throw new Error("addEventListenerFromAnywhere not implemented on mobile");
  };

  BrowserRuntimeCommon.getLocalStorage = async (
    key: string
  ): Promise<Result> => {
    const { result }: Response = await BackendRequestManager.request({
      channel: MOBILE_CHANNEL_HOST_RPC_REQUEST,
      data: {
        id: generateUniqueId(),
        method: "getLocalStorage",
        params: [key],
      },
    });

    return result;
  };

  BrowserRuntimeCommon.removeLocalStorage = async (
    key: string
  ): Promise<Result> => {
    const { result }: Response = await BackendRequestManager.request({
      channel: MOBILE_CHANNEL_HOST_RPC_REQUEST,
      data: {
        id: generateUniqueId(),
        method: "removeLocalStorage",
        params: [key],
      },
    });

    return result;
  };

  BrowserRuntimeCommon.setLocalStorage = async (
    key: string,
    value: any
  ): Promise<Result> => {
    const { result }: Response = await BackendRequestManager.request({
      channel: MOBILE_CHANNEL_HOST_RPC_REQUEST,
      data: {
        id: generateUniqueId(),
        method: "setLocalStorage",
        params: [key, value],
      },
    });

    return result;
  };

  BrowserRuntimeCommon.clearLocalStorage = async (): Promise<Result> => {
    const { result }: Response = await BackendRequestManager.request({
      channel: MOBILE_CHANNEL_HOST_RPC_REQUEST,
      data: {
        id: generateUniqueId(),
        method: "clearLocalStorage",
        params: [],
      },
    });

    return result;
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
      (msg: any, _sender: any, sendResponse: any) => {
        if (msg.channel !== MOBILE_CHANNEL_BG_RESPONSE_INNER) {
          return;
        }
        BackendRequestManager.response(msg);
      }
    );
  } else {
    BrowserRuntimeCommon.addEventListenerFromAppUi(
      (msg: any, _sender: any, sendResponse: any) => {
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
      async (msg: any, _sender: any, sendResponse: any) => {
        if (msg.channel !== MOBILE_CHANNEL_HOST_RPC_REQUEST) {
          return;
        }
        const [result, error] = await handleHostRpcRequest(msg);

        sendResponse({
          id: msg.data.id,
          result,
          error,
        });
      }
    );
  }

  const handleHostRpcRequest = async ({
    data,
  }: {
    data: { id: string; method: string; params: Array<any> };
  }) => {
    const { method, params } = data;
    switch (method) {
      case "getLocalStorage":
        return await handleGetLocalStorage(params[0]);
      case "removeLocalStorage":
        return await handleRemoveLocalStorage(params[0]);
      case "setLocalStorage":
        return await handleSetLocalStorage(params[0], params[1]);
      case "clearLocalStorage":
        return await handleClearLocalStorage();
      default:
        return [];
    }
  };

  const handleRemoveLocalStorage = async (key: string) => {
    try {
      // @ts-expect-error
      await SecureStorage.remove(key);
      return ["success", undefined];
    } catch (error) {
      return ["error", error];
    }
  };

  const handleGetLocalStorage = async (key: string) => {
    try {
      // @ts-expect-error
      const value = await SecureStorage.get(key);
      const str = String(value);
      const json = JSON.parse(str);
      return [json, undefined];
    } catch (error) {
      return ["error", error];
    }
  };

  const handleSetLocalStorage = async (key: string, value: any) => {
    // @ts-expect-error
    await SecureStorage.set(key, JSON.stringify(value));
    return ["success", undefined];
  };

  const handleClearLocalStorage = async () => {
    try {
      // @ts-expect-error
      await SecureStorage.reset();
      return ["success", undefined];
    } catch (error) {
      return ["error", error];
    }
  };
}

class CommonRequestManager {
  static _resolvers: { [requestId: string]: any } = {};

  /**
   * Resolves a given response associated with a request.
   */
  public static response(msg: any) {
    const {
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
      // eslint-disable-next-line
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
      // eslint-disable-next-line
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
  // @ts-ignore
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  clients.forEach((client) => {
    client.postMessage(msg);
  });
}

async function postMsgFromAppUi(msg: any) {
  useStore
    .getState()
    ?.injectJavaScript?.(
      `window.postMessageToBackgroundViaWebview(${JSON.stringify(msg)}); true;`
    );
}
