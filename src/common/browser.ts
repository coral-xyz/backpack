// Chrome or firefox specific apis.
export class BrowserRuntime {
  public static sendMessage(msg: any, cb?: any) {
    // @ts-ignore
    chrome
      ? // @ts-ignore
        chrome.runtime.sendMessage(msg, cb)
      : // @ts-ignore
        browser.runtime.sendMessage(msg).then(cb);
  }

  public static addEventListener(listener: any): any {
    // @ts-ignore
    return chrome
      ? // @ts-ignore
        chrome.runtime.onMessage.addListener(listener)
      : // @ts-ignore
        browser.runtime.onmessage.addListener(listener);
  }

  public static getUrl(scriptName: string) {
    // @ts-ignore
    return chrome
      ? // @ts-ignore
        chrome.runtime.getURL(scriptName)
      : // @ts-ignore
        browser.runtime.getURL(scriptName);
  }

  public static sendMessageActiveTab(msg: any) {
    // @ts-ignore
    return chrome
      ? // @ts-ignore
        chrome.tabs.query(
          { active: true, currentWindow: true },
          (tabs: any) => {
            // @ts-ignore
            chrome.tabs.sendMessage(tabs[0].id, msg);
          }
        )
      : // @ts-ignore
        browser.tabs.query(
          { active: true, currentWindow: true },
          (tabs: any) => {
            // @ts-ignore
            browser.tabs.sendMessage(tabs[0].id, msg);
          }
        );
  }

  public static async openWindow(options: any) {
    return new Promise((resolve, reject) => {
      chrome.windows.create(options, (newWindow) => {
        // todo: firefox
        const error = BrowserRuntime.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  public static checkForError() {
    // @ts-ignore
    const { lastError } = chrome ? chrome.runtime : browser.runtime;
    if (!lastError) {
      return undefined;
    }
    if (lastError.stack && lastError.message) {
      return lastError;
    }
    return new Error(lastError.message);
  }

  public static async getLastFocusedWindow(): Promise<Window> {
    return new Promise((resolve) => {
      chrome.windows.getLastFocused(resolve);
    });
  }

  public static connect(connectInfo: any): Port {
    // @ts-ignore
    return chrome
      ? chrome.runtime.connect(connectInfo)
      : // @ts-ignore
        browser.runtime.connect(connectInfo);
  }
}

type Window = any;
type Port = any;
