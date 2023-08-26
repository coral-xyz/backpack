//
// Browser apis that can be used in a mobile web view as well as the extension.
//
export class BrowserRuntimeCommon {
  public static sendMessageToBackground(msg: any, cb?: any) {
    return BrowserRuntimeCommon.sendMessageToAnywhere(msg, cb);
  }

  public static sendMessageToAppUi(msg: any, cb?: any) {
    return BrowserRuntimeCommon.sendMessageToAnywhere(msg, cb);
  }

  public static sendMessageToAnywhere(msg: any, cb?: any) {
    chrome.runtime.sendMessage(msg, cb);
  }

  public static addEventListenerFromBackground(listener: any): void {
    return BrowserRuntimeCommon.addEventListenerFromAnywhere(listener);
  }

  public static addEventListenerFromAppUi(listener: any): void {
    return BrowserRuntimeCommon.addEventListenerFromAnywhere(listener);
  }

  public static addEventListenerFromAnywhere(listener: any): void {
    return chrome.runtime.onMessage.addListener(listener);
  }

  public static async getLocalStorage(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
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

  public static async removeLocalStorage(key: string): Promise<void> {
    return chrome?.storage.local.remove(key);
  }

  public static async setLocalStorage(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const obj: any = {};
      obj[key] = value;
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

  public static async clearLocalStorage(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome?.storage.local.clear(() => {
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
    const { lastError } = chrome.runtime;
    return lastError ? new Error(lastError.message) : undefined;
  }
}
