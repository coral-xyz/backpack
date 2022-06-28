// Chrome or firefox specific apis.
export class BrowserRuntime {
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
      chrome.windows.create(options, (newWindow) => {
        // TODO: `browser` support
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
      return chrome.storage.local.get(key, (result) => {
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
      chrome.storage.local.set(obj, () => {
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
