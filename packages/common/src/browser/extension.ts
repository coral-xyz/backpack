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
    return chrome.runtime.getURL(scriptName);
  }

  public static sendMessageActiveTab(msg: any) {
    return chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) chrome.tabs.sendMessage(tab.id, msg);
    });
  }

  public static sendMessageTab(tabId: number, msg: any) {
    chrome.tabs.sendMessage(tabId, msg);
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
      chrome.windows.getLastFocused(resolve);
    });
  }

  public static activeTab(): Promise<chrome.tabs.Tab>;
  public static activeTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        resolve(tab);
      });
    });
  }

  public static closeActiveTab(): void {
    chrome.tabs.getCurrent((tab) => {
      if (tab?.id) chrome.tabs.remove(tab.id, function () {});
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
  url: string
): Promise<chrome.windows.Window> {
  const lastWindow = await BrowserRuntimeExtension.getLastFocusedWindow();

  const [EXTRA_HEIGHT, EXTRA_WIDTH] =
    (navigator as any).userAgentData.platform === "Windows"
      ? [36, 12]
      : [28, 0];

  const popupWindow = await BrowserRuntimeExtension._openWindow({
    url: `${url}`,
    type: "popup",
    width: EXTENSION_WIDTH + EXTRA_WIDTH,
    height: EXTENSION_HEIGHT + EXTRA_HEIGHT,
    top: lastWindow.top,
    left:
      (lastWindow.left ?? 0) +
      ((lastWindow.width ?? 0) - EXTENSION_WIDTH - EXTRA_WIDTH),
    focused: true,
  });
  return popupWindow;
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

export function openConnectHardware(
  blockchain: Blockchain,
  action: "create" | "derive" | "import" | "search",
  publicKey?: string
) {
  const url = `${EXPANDED_HTML}?${QUERY_CONNECT_HARDWARE}&blockchain=${blockchain}&action=${action}${
    publicKey ? "&publicKey=" + publicKey : ""
  }`;
  BrowserRuntimeExtension.openTab({
    url: chrome.runtime.getURL(url),
  });
}
