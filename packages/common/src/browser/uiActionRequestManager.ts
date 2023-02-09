import { v1 } from "uuid";

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
        resolve,
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

  public static async cancelAllRequests() {
    // Copy the array to aviod mutating it during iteration.
    const routines = [...UiActionRequestManager._routines];
    routines.forEach(({ cancelRoutine }) => {
      cancelRoutine();
    });
  }

  private static addResponseResolver(
    window: chrome.windows.Window,
    requestId: string,
    resolve: Function,
    reject: Function
  ): string {
    UiActionRequestManager._responseResolvers[requestId] = [
      (input: any) => resolve({ ...input, window }),
      reject,
    ];
    const cancelRoutine = () => {
      UiActionRequestManager.removeResponseResolver(requestId);
      resolve({
        // @ts-ignore
        id: requestId,
        result: undefined,
        error: undefined,
        // Treat a cancel the same as a closed window, i.e., an effective
        // rejection.
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
