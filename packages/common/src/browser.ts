import { logFromAnywhere } from "./logging";
import { vanillaStore } from "./zustand";

export class BrowserRuntime {
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

  public static getUrl(scriptName: string): string {
    return chrome
      ? chrome.runtime.getURL(scriptName)
      : browser.runtime.getURL(scriptName);
  }

  public static sendMessageActiveTab(msg: any) {
    return chrome
      ? chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          if (tab?.id) chrome.tabs.sendMessage(tab.id, msg);
        })
      : browser.tabs
          .query({ active: true, currentWindow: true })
          .then(([tab]) => {
            if (tab?.id) browser.tabs.sendMessage(tab.id, msg);
          });
  }

  public static sendMessageTab(tabId: number, msg: any) {
    chrome
      ? chrome.tabs.sendMessage(tabId, msg)
      : browser.tabs.sendMessage(tabId, msg);
  }

  public static async openWindow(options: chrome.windows.CreateData) {
    return new Promise((resolve, reject) => {
      // TODO: `browser` support
      chrome?.windows.create(options, (newWindow) => {
        const error = BrowserRuntime.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  public static checkForError() {
    const { lastError } = chrome ? chrome.runtime : browser.runtime;
    return lastError ? new Error(lastError.message) : undefined;
  }

  public static async getLastFocusedWindow(): Promise<chrome.windows.Window>;
  public static async getLastFocusedWindow(): Promise<browser.windows.Window>;
  public static async getLastFocusedWindow() {
    return new Promise((resolve) => {
      chrome
        ? chrome.windows.getLastFocused(resolve)
        : browser.windows.getLastFocused().then(resolve);
    });
  }

  public static connect(
    connectInfo?: chrome.runtime.ConnectInfo
  ): chrome.runtime.Port;
  public static connect(): browser.runtime.Port;
  public static connect(connectInfo?) {
    return chrome
      ? chrome.runtime.connect(connectInfo)
      : browser.runtime.connect();
  }

  public static async getLocalStorage(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // TODO: add `browser` support
      return chrome?.storage.local.get(key, (result) => {
        const err = BrowserRuntime.checkForError();
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
        const err = BrowserRuntime.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public static closeActiveTab(): void {
    chrome
      ? chrome.tabs.getCurrent((tab) => {
          if (tab?.id) chrome.tabs.remove(tab.id, function () {});
        })
      : browser.tabs.getCurrent().then((tab) => {
          if (tab?.id) browser.tabs.remove(tab.id);
        });
  }

  public static activeTab(): Promise<chrome.tabs.Tab>;
  public static activeTab(): Promise<browser.tabs.Tab>;
  public static activeTab() {
    return new Promise((resolve) => {
      chrome
        ? chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            resolve(tab);
          })
        : browser.tabs
            .query({ active: true, currentWindow: true })
            .then(([tab]) => {
              resolve(tab);
            });
    });
  }
}

const REQUESTS = {};

export function armaniHandleResponse(event: any) {
  console.log("armani here test", event, REQUESTS);
}

const chrome = globalThis.chrome
  ? // `global.chrome` exists, we're in chromium. Set `chrome` to `global.chrome`
    globalThis.chrome
  : globalThis.browser
  ? // `global.browser` exists, we're in FF/safari. Set `chrome` to `undefined`
    undefined
  : //
    // we don't have `global.chrome` or `global.browser`, this means we're in the app.
    // We can make our own version of `chrome` with a minimal implementation.

    // TODO: make these functions actually do something useful
    ({
      runtime: {
        connect(connectInfo) {
          logFromAnywhere("connect");
        },
        getURL(path) {
          logFromAnywhere({ getURL: path });
        },
        lastError: undefined,
        onMessage: {
          addListener(cb) {
            logFromAnywhere("armani 1234");
            self.addEventListener("message", (event) => {
              cb(event.data, {}, (result) => {
                logFromAnywhere({ sendBackResult: result });

                // requests[event.data.id].resolve(result);
                // delete requests[event.data.id];

                // TODO: send result back to frontend over postMessage
              });
            });
          },
        },
        async sendMessage(msg, cb) {
          logFromAnywhere({ sendMessage: { msg, cb } });

          /*
          cb(await (() =>
            new Promise((resolve, reject) => {
							REQUESTS[msg.data.id] = { resolve, reject };
              vanillaStore
                .getState()
                .injectJavaScript?.(
                  `window.postMessageToBackgroundViaWebview(${JSON.stringify(
                    msg
                  )}); true;`
                );
							resolve('locked');
              // TODO: resolve after receiving response from backend serviceworker
            }))());
					*/
          cb("locked");
        },
      },
      storage: {
        local: {
          get(key: string, callback) {
            // return empty values for now, mimicing an empty store until
            // the real store is implemented in the app
            logFromAnywhere({
              "storage.local.get": { key },
              returning: { [key]: undefined },
            });
            callback({ [key]: undefined });
          },
          set(items, callback) {
            logFromAnywhere({ "storage.local.set": { items, callback } });
          },
        },
      },
      tabs: {
        remove(tabIds, callback) {
          logFromAnywhere({ "tabs.remove": { tabIds, callback } });
        },
        sendMessage(tabId, message) {
          logFromAnywhere({ "tabs.sendMessage": { tabId, message } });
        },
        query(queryInfo) {
          logFromAnywhere({ "tabs.query": { queryInfo } });
        },
      },
      windows: {
        create(createData, callback) {
          logFromAnywhere({ "windows.create": { createData, callback } });
        },
        getLastFocused(callback) {
          logFromAnywhere({ "windows.getLastFocused": { callback } });
        },
      },
    } as typeof globalThis.chrome);
