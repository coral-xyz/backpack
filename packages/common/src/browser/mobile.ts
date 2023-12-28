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
import { generateUniqueId, IS_MOBILE } from "../utils";
import type { State } from "../zustand-store";
import { vanillaStore } from "../zustand-store";

import AsyncStorage from "./AsyncStorage";
import { BrowserRuntimeCommon } from "./common";

const logger = getLogger("common/mobile");

type MessagePayload = Record<string, any>;
type Result = any;
type Response = {
  id: string;
  result: Result;
  error: any;
};

/**
 * Event emitter for *all* events on the web view component.
 */
export const EVENT_EMITTER = new EventEmitter();

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

  EVENT_EMITTER.on("from-background-webview", (event) => {
    // to log raw objects and not stringified objects use console.debug instead
    logger.debug("from-background-webview:", JSON.stringify(event));
    EVENT_LISTENERS.forEach((handler: any) => handler(event));
  });

  EVENT_EMITTER.on("from-app", (event: { channel: string; data: any }) => {
    logger.debug("from-app:", JSON.stringify(event));
    EVENT_LISTENERS.forEach((handler: any) => handler(event));
  });

  //////////////////////////////////////////////////////////////////////////////
  //
  // Handle all events here. We have a single entrypoint for both the
  // service worker and the app ui code, respectively, which then dispatches
  // to all the listener handlers.
  //
  //////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////
  //
  // Monkey patch the BrowserRuntimeCommon apis for mobile.
  //
  //////////////////////////////////////////////////////////////////////////////

  // the actual app -> service worker
  // on the client this is powered by globalThis.chrome?.runtime?.sendMessage, so we try to recreate that here
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
  // on the client this is powered by globalThis.chrome?.runtime?.sendMessage, so we try to recreate that here
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
      if (!event?.data?.wrappedEvent) return;
      cb(event.data.wrappedEvent, {}, (result: any) => {
        // eslint-disable-next-line
        postMessageFromWebViewToApp({
          channel: MOBILE_CHANNEL_FE_RESPONSE,
          data: {
            wrappedEvent: {
              channel: MOBILE_CHANNEL_FE_RESPONSE_INNER,
              data: result,
            },
          },
        });
      });
    };

    EVENT_LISTENERS.push(handler);
    return handler;
  };

  BrowserRuntimeCommon.addEventListenerFromAppUi = (cb) => {
    const handler = (event: any) => {
      if (!event?.data?.wrappedEvent) return;
      cb(event.data.wrappedEvent, {}, (result: any) => {
        postMessageFromAppToHiddenBackgroundWebView({
          channel: MOBILE_CHANNEL_BG_RESPONSE,
          data: {
            wrappedEvent: {
              channel: MOBILE_CHANNEL_BG_RESPONSE_INNER,
              data: result,
            },
          },
        });
      });
    };

    EVENT_LISTENERS.push(handler);
    return handler;
  };

  BrowserRuntimeCommon.sendMessageToAnywhere = (_msg, _cb) => {
    // TODO: removing-mobile-service-worker
    // WEB_VIEW_EVENTS.emit("anywhere", msg);
  };

  // eslint-disable-next-line
  BrowserRuntimeCommon.addEventListenerFromAnywhere = (_listener) => {
    // TODO: removing-mobile-service-worker
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

  BrowserRuntimeCommon.addEventListenerFromBackground(
    (msg: MessagePayload, _sender: any) => {
      if (msg.channel === MOBILE_CHANNEL_BG_RESPONSE_INNER) {
        BackendRequestManager.response(msg);
      } else if (msg.channel === MOBILE_CHANNEL_FE_RESPONSE_INNER) {
        FrontendRequestManager.response(msg);
      }
    }
  );

  //////////////////////////////////////////////////////////////////////////////
  //
  // RPC "server" APIs.
  //
  // These APIs run in the context of the frontend react-native app code and
  // give the service worker access to resources provided by the host mobile
  // app.
  //
  //////////////////////////////////////////////////////////////////////////////

  if (!globalThis?.ReactNativeWebView) {
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
      await AsyncStorage.removeItem(key);
      return ["success", undefined];
    } catch (error) {
      return ["error", error];
    }
  };

  const handleGetLocalStorage = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      const str = String(value);
      const json = JSON.parse(str);
      return [json, undefined];
    } catch (error) {
      return ["error", error];
    }
  };

  const handleSetLocalStorage = async (key: string, value: any) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return ["success", undefined];
  };

  const handleClearLocalStorage = async () => {
    try {
      await AsyncStorage.clear();
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
  public static response(msg: MessagePayload) {
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
  public static request<T = any>(msg: MessagePayload): Promise<T> {
    return new Promise((resolve, reject) => {
      CommonRequestManager._resolvers[msg.data.id] = { resolve, reject };
      postMessageFromAppToHiddenBackgroundWebView({
        channel: MOBILE_CHANNEL_FE_REQUEST,
        data: {
          wrappedEvent: msg,
        },
      });
    });
  }
}

class BackendRequestManager extends CommonRequestManager {
  public static request<T = any>(msg: MessagePayload): Promise<T> {
    return new Promise((resolve, reject) => {
      CommonRequestManager._resolvers[msg.data.id] = { resolve, reject };
      // eslint-disable-next-line
      postMessageFromWebViewToApp({
        channel: MOBILE_CHANNEL_BG_REQUEST,
        data: {
          wrappedEvent: msg,
        },
      });
    });
  }
}

export function postMessageFromWebViewToApp(msg: MessagePayload) {
  globalThis.ReactNativeWebView?.postMessage(JSON.stringify(msg));
}

export const postMessageFromAppToWebView = (
  type: "hidden-background" | "browser"
) => {
  const queue = [] as MessagePayload;
  return (msg: MessagePayload, url?: string) => {
    const sender =
      type === "hidden-background"
        ? vanillaStore.getState().injectJavaScriptIntoHiddenWebView
        : vanillaStore.getState().injectJavaScriptIntoBrowserWebView;
    if (sender) {
      while (queue.length > 0) {
        const queuedMsg = queue.shift();
        injectPostMessage(sender, queuedMsg, type, url);
      }
      injectPostMessage(sender, msg, type, url);
    } else {
      queue.push(msg);
    }
  };
};

export const postMessageFromAppToHiddenBackgroundWebView =
  postMessageFromAppToWebView("hidden-background");

export const postMessageFromAppToBrowserWebView =
  postMessageFromAppToWebView("browser");

function injectPostMessage(
  injector:
    | State["injectJavaScriptIntoHiddenWebView"]
    | State["injectJavaScriptIntoBrowserWebView"],
  msg: MessagePayload,
  type: string,
  url?: string
) {
  if (url && url !== msg.origin.address) {
    return;
  }

  injector!(
    wrapJavaScriptForWebViewInjection(
      `window.___fromApp(${JSON.stringify({ ...msg, type })});`
    )
  );
}

/**
 * Wraps a JavaScript string into IIFE with `; true;` at the end
 * of the string. See: https://shorturl.at/ipwAD for why that's needed
 */
export const wrapJavaScriptForWebViewInjection = (js: string) =>
  `(()=>{${js}})(); true;`;
