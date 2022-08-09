import { BrowserRuntimeCommon } from "./common";
import {
  EXTENSION_WIDTH,
  EXTENSION_HEIGHT,
  QUERY_LOCKED,
  QUERY_APPROVAL,
  QUERY_LOCKED_APPROVAL,
  QUERY_APPROVE_MESSAGE,
  QUERY_APPROVE_TRANSACTION,
  QUERY_CONNECT_HARDWARE,
  QUERY_ONBOARDING,
} from "../constants";

//
// Browser apis that can be used on extension only.
//
export class BrowserRuntimeExtension {
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
        const error = BrowserRuntimeCommon.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
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

  public static closeActiveTab(): void {
    chrome
      ? chrome.tabs.getCurrent((tab) => {
          if (tab?.id) chrome.tabs.remove(tab.id, function () {});
        })
      : browser.tabs.getCurrent().then((tab) => {
          if (tab?.id) browser.tabs.remove(tab.id);
        });
  }
}

////////////////////////////////////////////////////////////////////////////////
// Open window APIs.
////////////////////////////////////////////////////////////////////////////////

const POPUP_HTML = "popup.html";
const EXPANDED_HTML = "options.html";

export async function openLockedApprovalPopupWindow(
  origin: string,
  title: string,
  requestId: number
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_LOCKED_APPROVAL}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}`;
  return openPopupWindow(url);
}

export async function openLockedPopupWindow(
  origin: string,
  title: string,
  requestId: number
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_LOCKED}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}`;
  return openPopupWindow(url);
}

export async function openApprovalPopupWindow(
  origin: string,
  title: string,
  requestId: number
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_APPROVAL}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}`;
  return openPopupWindow(url);
}

export async function openApproveTransactionPopupWindow(
  origin: string,
  title: string,
  requestId: number,
  txMsg: string
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_APPROVE_TRANSACTION}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&txMsg=${txMsg}`;
  return await openPopupWindow(url);
}

export async function openApproveMessagePopupWindow(
  origin: string,
  title: string,
  requestId: number,
  message: string
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_APPROVE_MESSAGE}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&message=${message}`;
  return await openPopupWindow(url);
}

export async function openPopupWindow(
  url: string
): Promise<chrome.windows.Window> {
  const MACOS_TOOLBAR_HEIGHT = 28;
  const WINDOWS_TOOLBAR_HEIGHT = 28; // TODO: confirm this.
  function getOs() {
    const os = ["Windows", "Linux", "Mac"];
    return os.find((v) => navigator.appVersion.indexOf(v) >= 0);
  }
  function isMacOs(): boolean {
    return getOs() === "Mac";
  }
  function isWindows(): boolean {
    return getOs() === "Windows";
  }

  return new Promise((resolve, reject) => {
    BrowserRuntimeExtension.getLastFocusedWindow().then((window: any) => {
      BrowserRuntimeExtension.openWindow({
        url: `${url}`,
        type: "popup",
        width: EXTENSION_WIDTH,
        height:
          EXTENSION_HEIGHT +
          (isMacOs()
            ? MACOS_TOOLBAR_HEIGHT
            : isWindows()
            ? WINDOWS_TOOLBAR_HEIGHT
            : 0),
        top: window.top,
        left: window.left + (window.width - EXTENSION_WIDTH),
        focused: true,
      }).then((window: any) => {
        resolve(window);
      });
    });
  });
}

export function openOnboarding() {
  const url = `${EXPANDED_HTML}?${QUERY_ONBOARDING}`;
  window.open(chrome.runtime.getURL(url), "_blank");
}

export function openConnectHardware() {
  const url = `${EXPANDED_HTML}?${QUERY_CONNECT_HARDWARE}`;
  window.open(chrome.runtime.getURL(url), "_blank");
}
