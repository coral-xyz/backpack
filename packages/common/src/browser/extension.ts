import {
  EXTENSION_HEIGHT,
  EXTENSION_WIDTH,
  QUERY_ADD_USER_ACCOUNT,
  QUERY_APPROVAL,
  QUERY_APPROVE_ALL_TRANSACTIONS,
  QUERY_APPROVE_MESSAGE,
  QUERY_APPROVE_TRANSACTION,
  QUERY_CONNECT_HARDWARE,
  QUERY_LOCKED,
  QUERY_ONBOARDING,
} from "../constants";
import type { Blockchain } from "../types";

import { BrowserRuntimeCommon } from "./common";

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

  public static async openTab(options: chrome.tabs.CreateProperties) {
    return new Promise((resolve, reject) => {
      // TODO: `browser` support
      chrome?.tabs.create(options, (newWindow) => {
        const error = BrowserRuntimeCommon.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  public static async openWindow(options: chrome.windows.CreateData) {
    return new Promise(async (resolve, reject) => {
      // TODO: `browser` support
      // try to reuse existing popup window
      try {
        const popupWindowId: number | undefined =
          await BrowserRuntimeCommon.getLocalStorage("popupWindowId");

        if (popupWindowId) {
          const popupWindow = await chrome?.windows.get(popupWindowId);

          if (popupWindow) {
            const tabs = await chrome.tabs.query({ windowId: popupWindowId });

            if (tabs.length === 1) {
              const tab = tabs[0];
              const url: string = Array.isArray(options.url)
                ? options.url[0]!
                : options.url!;
              const updatedTab = await chrome.tabs.update(tab.id!, { url });

              if (updatedTab) {
                const popupWindow = await chrome?.windows.update(
                  updatedTab.windowId,
                  { focused: true }
                );
                return resolve(popupWindow);
              } else {
                const error = BrowserRuntimeCommon.checkForError();
                return reject(error);
              }
            }
          }
        }
      } catch (e) {
        // fall through to create new window
      }
      // if nothign to reuse create new window.
      try {
        const newPopupWindow = await chrome?.windows.create(options);
        if (newPopupWindow) {
          BrowserRuntimeCommon.setLocalStorage(
            "popupWindowId",
            newPopupWindow.id
          );
          resolve(newPopupWindow);
        }
        const error = BrowserRuntimeCommon.checkForError();
        return reject(error);
      } catch (e) {
        const error = BrowserRuntimeCommon.checkForError();
        return reject(error);
      }
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

  public static closeWindow(id: number) {
    chrome.windows.remove(id);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Open window APIs.
////////////////////////////////////////////////////////////////////////////////

const POPUP_HTML = "popup.html";
const EXPANDED_HTML = "options.html";

export async function openXnft(
  xnftAddress: string
): Promise<chrome.windows.Window> {
  const props = encodeURIComponent(JSON.stringify({ xnftAddress }));
  const url = `${POPUP_HTML}#?pluginProps=${props}`;
  return openPopupWindow(url);
}

export async function openLockedPopupWindow(
  origin: string,
  title: string,
  requestId: number,
  blockchain: Blockchain
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_LOCKED}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&blockchain=${blockchain}`;
  return openPopupWindow(url);
}

export async function openApprovalPopupWindow(
  origin: string,
  title: string,
  requestId: number,
  blockchain: Blockchain
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_APPROVAL}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&blockchain=${blockchain}`;
  return openPopupWindow(url);
}

export async function openApproveTransactionPopupWindow(
  origin: string,
  title: string,
  requestId: number,
  tx: string,
  walletAddress: string,
  blockchain: Blockchain
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_APPROVE_TRANSACTION}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&tx=${tx}&wallet=${walletAddress}&blockchain=${blockchain}`;
  return await openPopupWindow(url);
}

export async function openApproveAllTransactionsPopupWindow(
  origin: string,
  title: string,
  requestId: number,
  txs: Array<string>,
  walletAddress: string,
  blockchain: Blockchain
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const txsStr = encodeURIComponent(JSON.stringify(txs));
  const url = `${POPUP_HTML}?${QUERY_APPROVE_ALL_TRANSACTIONS}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&txs=${txsStr}&wallet=${walletAddress}&blockchain=${blockchain}`;
  return await openPopupWindow(url);
}

export async function openApproveMessagePopupWindow(
  origin: string,
  title: string,
  requestId: number,
  message: string,
  walletAddress: string,
  blockchain: Blockchain
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_APPROVE_MESSAGE}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&message=${message}&wallet=${walletAddress}&blockchain=${blockchain}`;
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

  return new Promise((resolve) => {
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
  BrowserRuntimeExtension.openTab({
    url: chrome.runtime.getURL(url),
  });
}

export function openAddUserAccount() {
  const url = `${EXPANDED_HTML}?${QUERY_ADD_USER_ACCOUNT}`;
  BrowserRuntimeExtension.openTab({
    url: chrome.runtime.getURL(url),
  });
}

export function openConnectHardware(blockchain: Blockchain) {
  const url = `${EXPANDED_HTML}?${QUERY_CONNECT_HARDWARE}&blockchain=${blockchain}`;
  BrowserRuntimeExtension.openTab({
    url: chrome.runtime.getURL(url),
  });
}
