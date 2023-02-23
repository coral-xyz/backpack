import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { openPopupWindow } from "@coral-xyz/common/dist/esm/browser";
import { BACKPACK_FEATURE_POP_MODE } from "@coral-xyz/common/dist/esm/generated-config";

import "./index.css";

const App = lazy(() => import("./app/App"));
const LedgerIframe = lazy(() => import("./components/LedgerIframe"));

// Connect to the background script so it can detect if the popup is closed
chrome.runtime.connect();

//
// Configure event listeners.
//
document.addEventListener("keypress", async function onPress(event) {
  //
  // Pop open the window.
  //
  if (BACKPACK_FEATURE_POP_MODE) {
    if (event.key === "g" && event.ctrlKey) {
      const currentWindow = await chrome.windows.getCurrent();
      const popupWindow = await openPopupWindow("popup.html");
      if (currentWindow.id !== popupWindow.id) {
        window.close();
      }
    }
  }
});

// Render the UI.
// TOOD(react) createRoot is required: https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <>
    <Suspense fallback={null}>
      <App />
    </Suspense>
    <Suspense fallback={null}>
      <LedgerIframe />
    </Suspense>
  </>
);
