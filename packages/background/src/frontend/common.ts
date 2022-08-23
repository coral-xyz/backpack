import { getLogger } from "@coral-xyz/common";
import type { RpcResponse, Context } from "@coral-xyz/common";
import type { Backend } from "../backend/core";
import { SUCCESS_RESPONSE } from "../backend/core";

export const logger = getLogger("server-injected");

export class RequestManager {
  static _requestId = 0;
  static _responseResolvers: any = {};

  // Initiate a request. The given popupFn should relay the given requestId to
  // the UI, which will send it back with a response.
  //
  // Note that there are two ways we can receive a response.
  //
  // 1) The user can explicit perform a UI action via our components.
  // 2) The user can close the window.
  //
  public static requestUiAction<T = any>(
    popupFn: (reqId: number) => Promise<chrome.windows.Window>
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const requestId = RequestManager.addResponseResolver(resolve, reject);
      const window = await popupFn(requestId);
      chrome.windows.onRemoved.addListener((windowId) => {
        if (windowId === window.id) {
          RequestManager.removeResponseResolver(requestId);
          resolve({
            // @ts-ignore
            id: requestId,
            result: undefined,
            error: undefined,
            windowClosed: true,
          });
        }
      });
    });
  }

  // Resolve a response initiated via `requestUiAction`.
  public static resolveResponse(id: number, result: any, error: any) {
    const resolver = RequestManager.getResponseResolver(id);
    if (!resolver) {
      throw new Error(`unable to find response resolver for: ${id}`);
    }

    const [resolve, reject] = resolver;

    RequestManager.removeResponseResolver(id);

    if (error) {
      reject(error);
    }

    resolve({
      id,
      result,
      error,
      windowClosed: undefined,
    });
  }

  private static addResponseResolver(resolve: any, reject: any): number {
    const requestId = RequestManager.nextRequestId();
    RequestManager._responseResolvers[requestId] = [resolve, reject];
    return requestId;
  }

  private static nextRequestId(): number {
    const r = RequestManager._requestId;
    RequestManager._requestId += 1;
    return r;
  }

  private static getResponseResolver(requestId: number): [Function, Function] {
    return RequestManager._responseResolvers[requestId];
  }

  private static removeResponseResolver(requestId: number) {
    delete RequestManager._responseResolvers[requestId];
  }
}

export async function handlePopupUiResponse(
  ctx: Context<Backend>,
  msg: RpcResponse
): Promise<string> {
  const { id, result, error } = msg;
  logger.debug("handle popup ui response", msg);
  RequestManager.resolveResponse(id, result, error);
  return SUCCESS_RESPONSE;
}
