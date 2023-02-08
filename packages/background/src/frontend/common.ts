import type { Context, RpcResponse } from "@coral-xyz/common";
import { getLogger } from "@coral-xyz/common";

import type { Backend } from "../backend/core";
import { SUCCESS_RESPONSE } from "../backend/core";

const logger = getLogger("server-injected-solana");

export class UiActionRequestManager {
  static _requestId = 0;
  static _responseResolvers: any = {};

  // Initiate a request. The given popupFn should relay the given requestmanagerId to
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
      const requestId = UiActionRequestManager.nextRequestId();
      const window = await popupFn(requestId);
      UiActionRequestManager.addResponseResolver(
        requestId,
        (input: any) => resolve({ ...input, window }),
        reject
      );
      chrome.windows.onRemoved.addListener((windowId) => {
        if (windowId === window.id) {
          UiActionRequestManager.removeResponseResolver(requestId);
          resolve({
            // @ts-ignore
            id: requestId,
            result: undefined,
            error: undefined,
            windowClosed: true,
            window,
          });
        }
      });
    });
  }

  // Resolve a response initiated via `requestUiAction`.
  public static resolveResponse(id: number, result: any, error: any) {
    const resolver = UiActionRequestManager.getResponseResolver(id);
    if (!resolver) {
      throw new Error(`unable to find response resolver for: ${id}`);
    }

    const [resolve, _reject] = resolver;

    UiActionRequestManager.removeResponseResolver(id);

    resolve({
      id,
      result,
      error,
      windowClosed: undefined,
    });
  }

  private static addResponseResolver(
    requestId: number,
    resolve: Function,
    reject: Function
  ): number {
    UiActionRequestManager._responseResolvers[requestId] = [resolve, reject];
    return requestId;
  }

  private static nextRequestId(): number {
    const r = UiActionRequestManager._requestId;
    UiActionRequestManager._requestId += 1;
    return r;
  }

  private static getResponseResolver(requestId: number): [Function, Function] {
    return UiActionRequestManager._responseResolvers[requestId];
  }

  private static removeResponseResolver(requestId: number) {
    delete UiActionRequestManager._responseResolvers[requestId];
  }
}

export async function handlePopupUiResponse(
  ctx: Context<Backend>,
  msg: RpcResponse
): Promise<string> {
  const { id, result, error } = msg;
  logger.debug("handle popup ui response", msg);
  UiActionRequestManager.resolveResponse(id, result, error);
  return SUCCESS_RESPONSE;
}
