import { logFromAnywhere } from "../logging";
import { vanillaStore } from "../zustand";

//
// Browser apis that can be used in a mobile web view as well as the extension.
//
export class BrowserRuntimeCommon {
  // `chrome` = global.chrome OR undefined OR a polyfill used by the mobile app
  // `browser` = safari and firefox's equivelent of global.chrome

  public static sendMessage(msg: any, cb?: any) {
    chrome
      ? chrome.runtime.sendMessage(msg, cb)
      : browser.runtime.sendMessage(msg).then(cb);
  }

  public static addEventListener(listener: any): void {
    return chrome
      ? chrome.runtime.onMessage.addListener(listener)
      : browser.runtime.onMessage.addListener(listener);
  }

  public static async getLocalStorage(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // TODO: add `browser` support
      return chrome?.storage.local.get(key, (result) => {
        const err = BrowserRuntimeCommon.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  public static async setLocalStorage(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const obj: any = {};
      obj[key] = value;
      // TODO: add `browser` support
      chrome?.storage.local.set(obj, () => {
        const err = BrowserRuntimeCommon.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public static checkForError() {
    const { lastError } = chrome ? chrome.runtime : browser.runtime;
    return lastError ? new Error(lastError.message) : undefined;
  }
}

//
// Monkey patch for mobile.
//
globalThis.chrome
  ? // `global.chrome` exists, we're in chromium. Set `chrome` to `global.chrome`
    globalThis.chrome
  : globalThis.browser
  ? // `global.browser` exists, we're in FF/safari. Set `chrome` to `undefined`
    undefined
  : //
    // we don't have `global.chrome` or `global.browser`, this means we're in the app.
    // We can make our own version of `chrome` with a minimal implementation.

    // TODO: make these functions actually do something useful
    (() => {
      //
      // Currently assumes this is only called from the front end app code on
      // mobile.
      //
      BrowserRuntimeCommon.sendMessage = (msg, cb) => {
        logFromAnywhere({ sendMessage: { msg, cb } });

        const promise = new Promise((resolve, reject) => {
          vanillaStore
            .getState()
            .injectJavaScript?.(
              `window.postMessageToBackgroundViaWebview(${JSON.stringify(
                msg
              )}); true;`
            );
          // TODO: resolve after receiving response from backend serviceworker
          resolve({ result: "locked" });
        });
        promise.then(cb);
      };
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
                data: {
                  result,
                },
              });
            });
          });
        });
      };
      BrowserRuntimeCommon.getLocalStorage = async (
        key: string
      ): Promise<any> => {
        // todo
      };
      BrowserRuntimeCommon.setLocalStorage = async (
        key: string,
        value: any
      ): Promise<void> => {
        // todo
      };
    })();
