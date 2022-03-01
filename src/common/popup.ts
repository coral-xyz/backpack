import { BrowserRuntime, EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../common";

export function openPopupWindow() {
  BrowserRuntime.getLastFocusedWindow().then((window: any) => {
    BrowserRuntime.openWindow({
      url: "popup.html",
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
