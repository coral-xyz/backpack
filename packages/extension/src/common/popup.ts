import {
  BrowserRuntime,
  EXTENSION_WIDTH,
  EXTENSION_HEIGHT,
} from "@200ms/common";

const POPUP_HTML = "popup.html";
const EXPANDED_HTML = "options.html";
export const QUERY_LOCKED = "locked=true";
export const QUERY_APPROVAL = "approval=true";
export const QUERY_LOCKED_APPROVAL = "locked-approval=true";
export const QUERY_APPROVE_TRANSACTION = "approve-tx=true";
export const QUERY_APPROVE_MESSAGE = "approve-message=true";
export const QUERY_CONNECT_HARDWARE = "connect-hardware=true";
export const QUERY_ONBOARDING = "onboarding=true";

const MACOS_TOOLBAR_HEIGHT = 28;

export interface Window {
  id: number;
}

type Context = any; // TODO: remove.

export async function openLockedApprovalPopupWindow(
  ctx: Context,
  requestId: number
): Promise<Window> {
  const url = `${POPUP_HTML}?${QUERY_LOCKED_APPROVAL}&origin=${ctx.sender.origin}&requestId=${requestId}`;
  return openPopupWindow(ctx, url);
}

export async function openLockedPopupWindow(
  ctx: Context,
  requestId: number
): Promise<Window> {
  const url = `${POPUP_HTML}?${QUERY_LOCKED}&origin=${ctx.sender.origin}&requestId=${requestId}`;
  return openPopupWindow(ctx, url);
}

export async function openApprovalPopupWindow(
  ctx: Context,
  requestId: number
): Promise<Window> {
  const url = `${POPUP_HTML}?${QUERY_APPROVAL}&origin=${ctx.sender.origin}&requestId=${requestId}`;
  return openPopupWindow(ctx, url);
}

export async function openApproveTransactionPopupWindow(
  ctx: Context,
  requestId: number,
  tx: string
): Promise<Window> {
  const url = `${POPUP_HTML}?${QUERY_APPROVE_TRANSACTION}&origin=${ctx.sender.origin}&requestId=${requestId}&tx=${tx}`;
  return await openPopupWindow(ctx, url);
}

export async function openApproveMessagePopupWindow(
  ctx: Context,
  requestId: number,
  message: string
): Promise<Window> {
  const url = `${POPUP_HTML}?${QUERY_APPROVE_MESSAGE}&origin=${ctx.sender.origin}&requestId=${requestId}&message=${message}`;
  return await openPopupWindow(ctx, url);
}

async function openPopupWindow(ctx: Context, url: string): Promise<Window> {
  return new Promise((resolve, reject) => {
    BrowserRuntime.getLastFocusedWindow().then((window: any) => {
      BrowserRuntime.openWindow({
        url: `${url}`,
        type: "popup",
        width: EXTENSION_WIDTH,
        height: EXTENSION_HEIGHT + (isMacOs() ? MACOS_TOOLBAR_HEIGHT : 0),
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
  window.open(chrome.extension.getURL(url), "_blank");
}

export function openConnectHardware() {
  const url = `${EXPANDED_HTML}?${QUERY_CONNECT_HARDWARE}`;
  window.open(chrome.extension.getURL(url), "_blank");
}

export function isExtensionPopup() {
  // A bit of a hack, but we want to know this *on click*  of the extension
  // button and so the dimensions can be smaller since the view hasn't loaded.
  return (
    window.innerWidth <= EXTENSION_WIDTH &&
    window.innerHeight <= EXTENSION_HEIGHT
  );
}

function getOs() {
  const os = ["Windows", "Linux", "Mac"];
  return os.find((v) => navigator.appVersion.indexOf(v) >= 0);
}

function isMacOs(): boolean {
  return getOs() === "Mac";
}
