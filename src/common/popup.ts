import { BrowserRuntime, EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../common";

const POPUP_HTML = "popup.html";

export function openPopupWindow() {
  BrowserRuntime.getLastFocusedWindow().then((window: any) => {
    BrowserRuntime.openWindow({
      url: POPUP_HTML,
      type: "popup",
      width: EXTENSION_WIDTH,
      height: EXTENSION_HEIGHT,
      top: window.top,
      left: window.left + (window.width - EXTENSION_WIDTH),
      //      setSelfAsOpener: true, // Doesn't work on firefox.
      focused: true,
    });
  });
}

export function openExpandedExtension() {
  window.open(chrome.extension.getURL(POPUP_HTML), "_blank");
}
