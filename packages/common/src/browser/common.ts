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
    try {
      globalThis.chrome?.runtime?.sendMessage(msg, cb);
    } catch (e) {
      console.error(e);
    }
  }

  public static addEventListenerFromBackground(listener: any): void {
    return BrowserRuntimeCommon.addEventListenerFromAnywhere(listener);
  }

  public static addEventListenerFromAppUi(listener: any): void {
    return BrowserRuntimeCommon.addEventListenerFromAnywhere(listener);
  }

  public static addEventListenerFromAnywhere(listener: any): void {
    return globalThis.chrome?.runtime?.onMessage?.addListener(listener);
  }

  public static async getLocalStorage(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      return globalThis.chrome?.storage?.local?.get(key, (result) => {
        const err = BrowserRuntimeCommon.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  public static async getAllLocalStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      return globalThis.chrome?.storage?.local?.get((result) => {
        const err = BrowserRuntimeCommon.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  public static async removeLocalStorage(key: string): Promise<void> {
    return globalThis.chrome?.storage?.local?.remove(key);
  }

  public static async setLocalStorage(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const obj: any = {};
      obj[key] = value;
      globalThis.chrome?.storage?.local?.set(obj, () => {
        const err = BrowserRuntimeCommon.checkForError();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public static async setAllLocalStorage(items: {
    [key: string]: any;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      globalThis.chrome?.storage.local.clear(() => {
        globalThis.chrome?.storage?.local?.set(items, () => {
          const err = BrowserRuntimeCommon.checkForError();
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  public static async clearLocalStorage(): Promise<void> {
    return new Promise((resolve, reject) => {
      globalThis.chrome?.storage.local.clear(() => {
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
    const lastError = globalThis.chrome?.runtime?.lastError;
    return lastError ? new Error(lastError.message) : undefined;
  }
}
