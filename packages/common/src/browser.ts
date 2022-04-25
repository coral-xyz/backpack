import browser from "webextension-polyfill";

export class BrowserRuntime {
  public static sendMessage(msg: any, cb?: any) {
    return browser.runtime.sendMessage(msg).then(cb);
  }

  public static addEventListener(listener: any): any {
    return browser.runtime.onMessage.addListener(listener);
  }

  public static getUrl(scriptName: string) {
    return browser.runtime.getURL(scriptName);
  }

  public static sendMessageActiveTab(msg: any) {
    return browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        if (tabs[0]?.id) browser.tabs.sendMessage(tabs[0].id, msg);
      });
  }

  public static sendMessageTab(tabId: number, msg: any) {
    browser.tabs.sendMessage(tabId, msg);
  }

  public static sendMessageWindow(windowId: number, msg: any) {
    browser.windows.get(windowId).then((window) => {
      console.log("got window now send message", window, msg);
    });
  }

  public static async openWindow(options: any) {
    return new Promise((resolve, reject) => {
      browser.windows.create(options).then((newWindow) => {
        const error = BrowserRuntime.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  public static checkForError() {
    const { lastError } = browser.runtime;
    // if (lastError.stack && lastError.message) {
    //   return lastError;
    // }
    return lastError ? new Error(lastError.message) : undefined;
  }

  public static async getLastFocusedWindow(): Promise<Window> {
    return new Promise((resolve) => {
      browser.windows.getLastFocused().then(resolve);
    });
  }

  public static connect(connectInfo: any): Port {
    return browser.runtime.connect(connectInfo);
  }

  public static async getLocalStorage(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      return browser.storage.local.get(key).then((result) => {
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

      browser.storage.local.set(obj).then(() => {
        const err = BrowserRuntime.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public static closeActiveTab() {
    browser.tabs.getCurrent().then((tab) => {
      if (tab.id) browser.tabs.remove(tab.id);
    });
  }

  public static activeTab(): Promise<any> {
    return new Promise((resolve) => {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(([tab]) => {
          resolve(tab);
        });
    });
  }
}

type Window = any;
type Port = any;
