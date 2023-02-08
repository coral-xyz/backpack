import type { Context, RpcResponse } from "@coral-xyz/common";
import { getLogger } from "@coral-xyz/common";
import { v1 } from "uuid";

import type { Backend } from "../backend/core";
import { SUCCESS_RESPONSE } from "../backend/core";

const logger = getLogger("server-injected-solana");

export class UiActionRequestManager {
  static _requestId = 0;
  static _responseResolvers: any = {};
  static _routines: Array<{
    requestId: string;
    cancelRoutine: () => void;
    windowRemovedRoutine: (windowId: number) => void;
  }> = [];

  // Initiate a request. The given popupFn should relay the given requestmanagerId to
  // the UI, which will send it back with a response.
  //
  // Note that there are two ways we can receive a response.
  //
  // 1) The user can explicit perform a UI action via our components.
  // 2) The user can close the window.
  //
  public static requestUiAction<T = any>(
    popupFn: (reqId: string) => Promise<chrome.windows.Window>
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const requestId = v1();
      const window = await popupFn(requestId);
      UiActionRequestManager.addResponseResolver(
        window,
        requestId,
        (input: any) => resolve({ ...input, window }),
        reject
      );
    });
  }

  // Resolve a response initiated via `requestUiAction`.
  public static resolveResponse(id: string, result: any, error: any) {
    const resolver = UiActionRequestManager._responseResolvers[id];
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

  public cancelAllRequests() {
    UiActionRequestManager._routines.forEach(({ requestId, cancelRoutine }) => {
      cancelRoutine();
      UiActionRequestManager.removeResponseResolver(requestId);
    });
  }

  private static addResponseResolver(
    window: chrome.windows.Window,
    requestId: string,
    resolve: Function,
    reject: Function
  ): string {
    UiActionRequestManager._responseResolvers[requestId] = [resolve, reject];
    const cancelRoutine = () => {
      UiActionRequestManager.removeResponseResolver(requestId);
      resolve({
        // @ts-ignore
        id: requestId,
        result: undefined,
        error: undefined,
        windowClosed: true,
        window,
      });
    };
    const windowRemovedRoutine = (windowId: number) => {
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
    };
    chrome.windows.onRemoved.addListener(windowRemovedRoutine);
    UiActionRequestManager._routines.push({
      requestId,
      cancelRoutine,
      windowRemovedRoutine,
    });
    return requestId;
  }

  private static removeResponseResolver(requestId: string) {
    const routine = this._routines.find((r) => r.requestId === requestId);

    if (!routine) {
      throw new Error("invariant violation: routine not found");
    }

    delete UiActionRequestManager._responseResolvers[requestId];
    chrome.windows.onRemoved.removeListener(routine?.windowRemovedRoutine);
    UiActionRequestManager._routines = UiActionRequestManager._routines.filter(
      (r) => r.requestId !== requestId
    );
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
