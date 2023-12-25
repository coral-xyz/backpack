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
  QUERY_LOCKED_APPROVAL,
  QUERY_ONBOARDING,
} from "../constants";
import type { Blockchain } from "../types";

import { BrowserRuntimeCommon } from "./common";
import { UiActionRequestManager } from "./uiActionRequestManager";

//
// Browser apis that can be used on extension only.
//

export class BrowserRuntimeExtension {
  public static getUrl(scriptName: string): string {
    return globalThis.chrome?.runtime?.getURL(scriptName);
  }

  public static sendMessageActiveTab(msg: any) {
    return globalThis.chrome?.tabs?.query(
      { active: true, currentWindow: true },
      ([tab]) => {
        if (tab?.id) void globalThis.chrome?.tabs?.sendMessage?.(tab.id, msg);
      }
    );
  }

  public static sendMessageActiveTabs(_unusedMsg: any): Promise<any> {
    return chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) =>
        Promise.all(
          tabs.map((tab) => {
            if (tab.id) {
              return globalThis.chrome?.tabs?.sendMessage?.(tab.id, event);
            }
            return Promise.resolve();
          })
        )
      );
  }

  public static sendMessageTab(tabId: number, msg: any) {
    void globalThis.chrome?.tabs?.sendMessage?.(tabId, msg);
  }

  public static async openTab(options: chrome.tabs.CreateProperties) {
    return new Promise((resolve, reject) => {
      chrome?.tabs.create(options, (newWindow) => {
        const error = BrowserRuntimeCommon.checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  static async _openWindow(options: chrome.windows.CreateData) {
    //
    // Whenever a new window is opened, we reject all outstanding ui action
    // requests--e.g., for tx signing--as a way to deal with stale state so
    // that those promises can properly resolve with the right state,
    // i.e. user denied the request.
    //
    await UiActionRequestManager.cancelAllRequests();
    const newPopupWindow = await chrome?.windows.create(options);
    return newPopupWindow;
  }

  public static async getLastFocusedWindow(): Promise<chrome.windows.Window>;
  public static async getLastFocusedWindow() {
    return new Promise((resolve) => {
      globalThis.chrome?.windows?.getLastFocused?.(resolve);
    });
  }

  public static activeTab(): Promise<chrome.tabs.Tab>;
  public static activeTab() {
    return new Promise((resolve) => {
      globalThis.chrome?.tabs?.query?.(
        { active: true, currentWindow: true },
        ([tab]) => {
          resolve(tab);
        }
      );
    });
  }

  public static closeActiveTab(): void {
    chrome.tabs.getCurrent((tab) => {
      if (tab?.id) globalThis.chrome?.tabs?.remove?.(tab.id, function () {});
    });
  }

  public static closeWindow(id: number) {
    void globalThis.chrome?.windows?.remove?.(id);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Open window APIs.
////////////////////////////////////////////////////////////////////////////////

const POPUP_HTML = "popup.html";
const EXPANDED_HTML = "options.html";

export async function openLockedPopupWindow(
  origin: string,
  title: string,
  requestId: string,
  blockchain: Blockchain
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_LOCKED}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&blockchain=${blockchain}`;
  return openPopupWindow(url);
}

export function openLockedApprovalPopupWindow(
  origin: string,
  title: string,
  requestId: string,
  blockchain: Blockchain
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_LOCKED_APPROVAL}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&blockchain=${blockchain}`;
  return openPopupWindow(url);
}

export async function openApprovalPopupWindow(
  origin: string,
  title: string,
  requestId: string,
  blockchain: Blockchain
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_APPROVAL}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&blockchain=${blockchain}`;
  return openPopupWindow(url);
}

export async function openApproveTransactionPopupWindow(
  origin: string,
  title: string,
  requestId: string,
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
  requestId: string,
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
  requestId: string,
  message: string,
  walletAddress: string,
  blockchain: Blockchain
): Promise<chrome.windows.Window> {
  const encodedTitle = encodeURIComponent(title);
  const url = `${POPUP_HTML}?${QUERY_APPROVE_MESSAGE}&origin=${origin}&title=${encodedTitle}&requestId=${requestId}&message=${message}&wallet=${walletAddress}&blockchain=${blockchain}`;
  return await openPopupWindow(url);
}

export async function openPopupWindow(
  url: string,
  options?: { fullscreen?: boolean; height: number; width: number }
): Promise<chrome.windows.Window> {
  const lastWindow = await BrowserRuntimeExtension.getLastFocusedWindow();
  const fullscreen = options?.fullscreen;

  let width = isNaN(options?.width ?? NaN) ? EXTENSION_WIDTH : options!.width!;
  let height = isNaN(options?.height ?? NaN)
    ? EXTENSION_HEIGHT
    : options!.height!;

  if (fullscreen) {
    height = screen.availHeight;
    width = screen.availWidth;
  }

  const [EXTRA_HEIGHT, EXTRA_WIDTH] =
    (navigator as any).userAgentData.platform === "Windows"
      ? [36, 12]
      : [28, 0];

  const popupWindow = await BrowserRuntimeExtension._openWindow({
    url: `${url}`,
    type: "popup",
    width: width + EXTRA_WIDTH,
    height: height + EXTRA_HEIGHT,
    top: fullscreen ? 0 : lastWindow.top,
    left: fullscreen
      ? 0
      : (lastWindow.left ?? 0) +
        ((lastWindow.width ?? 0) - width - EXTRA_WIDTH),
    focused: true,
  });
  return popupWindow;
}

export function resizeExtensionWindow(options?: {
  height: number;
  width: number;
}): Window | undefined {
  const extensionWindows = chrome.extension.getViews();

  if (!extensionWindows || extensionWindows.length == 0) {
    return undefined;
  }

  const extensionWindow = extensionWindows[0];

  let width = isNaN(options?.width ?? NaN) ? EXTENSION_WIDTH : options!.width!;
  let height = isNaN(options?.height ?? NaN)
    ? EXTENSION_HEIGHT
    : options!.height!;

  //Please note that there is a maximum size of 800x600
  //https://developer.chrome.com/docs/extensions/reference/browserAction/#popup
  //If bigger than that, scrollbars will appear
  extensionWindow.document.documentElement.style.width = `${width}px`;
  extensionWindow.document.documentElement.style.height = `${height}px`;
  extensionWindow.document.documentElement.style.minHeight = "unset";
  extensionWindow.document.documentElement.style.minWidth = "unset";

  extensionWindow.document.body.style.width = `${width}px`;
  extensionWindow.document.body.style.height = `${height}px`;
  extensionWindow.document.body.style.minHeight = "unset";
  extensionWindow.document.body.style.minWidth = "unset";

  //this is an element created by backpack,
  //whose minHeight value is preventing the set height to work
  const rootElement = extensionWindow.document.getElementById("root");
  if (rootElement) {
    rootElement.style.minHeight = "unset";
    rootElement.style.minWidth = "unset";
  }

  //Do it also on the window in case we are popped out
  extensionWindow.resizeTo(width, height);

  //Use a timeout to set this listener to avoid a race condition with the first time it opens
  setTimeout(() => {
    extensionWindow.addEventListener("resize", () => {
      //If it gets resized to something other than what we set, means that we are in a popup.
      //Remove the previously set values and the listener.
      extensionWindow.document.documentElement.style.width = "unset";
      extensionWindow.document.documentElement.style.height = "unset";
      extensionWindow.document.body.style.width = "unset";
      extensionWindow.document.body.style.height = "unset";
      extensionWindow.removeEventListener("resize", this);
    });
  }, 1000);

  return extensionWindow;
}

export function openOnboarding() {
  const url = `${EXPANDED_HTML}?${QUERY_ONBOARDING}`;
  void BrowserRuntimeExtension.openTab({
    url: globalThis.chrome?.runtime?.getURL(url),
  });
}

export function openAddUserAccount() {
  const url = `${EXPANDED_HTML}?${QUERY_ADD_USER_ACCOUNT}`;
  void BrowserRuntimeExtension.openTab({
    url: globalThis.chrome?.runtime?.getURL(url),
  });
}
